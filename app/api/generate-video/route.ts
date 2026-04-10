import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'
import { enhancePrompt } from '@/lib/gemini'
import { fal, getFalModel } from '@/lib/fal'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, imageUrl, duration = '10' } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const trimmedPrompt = prompt.trim()
    if (trimmedPrompt.length < 3) {
      return NextResponse.json(
        { error: 'Prompt must be at least 3 characters' },
        { status: 400 }
      )
    }
    if (trimmedPrompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt must be under 500 characters' },
        { status: 400 }
      )
    }

    // Rate limit: 5 quick videos per 10 minutes per user
    const rateLimit = await checkRateLimit(supabase, user.id, 'quick')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. You can generate up to 5 quick videos per 10 minutes. Please wait ${Math.ceil((rateLimit.retryAfterSeconds ?? 600) / 60)} minutes.`,
        },
        { status: 429 }
      )
    }

    // Enhance prompt with Gemini
    let enhancedPrompt: string
    try {
      enhancedPrompt = await enhancePrompt(trimmedPrompt)
    } catch {
      enhancedPrompt = trimmedPrompt
    }

    // Create video record
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        original_prompt: trimmedPrompt,
        enhanced_prompt: enhancedPrompt,
        image_url: imageUrl || null,
        duration,
        status: 'processing',
        credits_used: 0,
      })
      .select()
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      )
    }

    // Submit to fal.ai queue
    const falModel = getFalModel(imageUrl)

    try {
      const falInput: Record<string, unknown> = {
        prompt: enhancedPrompt,
        duration,
        aspect_ratio: '16:9',
        cfg_scale: 0.5,
        negative_prompt: 'blur, distort, low quality, deformed face',
      }

      if (imageUrl) {
        falInput.image_url = imageUrl
      }

      const result = await fal.queue.submit(falModel, { input: falInput })

      await supabase
        .from('videos')
        .update({ fal_request_id: result.request_id })
        .eq('id', video.id)
    } catch (falError) {
      console.error('fal.ai submission error:', falError)
      await supabase
        .from('videos')
        .update({
          status: 'failed',
          error_message: 'Failed to submit to video generation service',
        })
        .eq('id', video.id)

      return NextResponse.json(
        { error: 'Failed to submit video generation job' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      videoId: video.id,
      status: 'processing',
      enhancedPrompt,
    })
  } catch (error) {
    console.error('generate-video error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
