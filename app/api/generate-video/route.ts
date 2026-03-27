import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
import { enhancePrompt } from '@/lib/gemini'
import { fal, FAL_MODEL } from '@/lib/fal'

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
    const { prompt } = body

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

    // Check credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    if (profile.credits < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits.' },
        { status: 402 }
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
        status: 'processing',
        credits_used: 1,
      })
      .select()
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Failed to create video record' },
        { status: 500 }
      )
    }

    // Atomically deduct 1 credit
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('id', user.id)
      .eq('credits', profile.credits) // optimistic lock

    if (creditError) {
      // Rollback video record
      await supabase.from('videos').delete().eq('id', video.id)
      return NextResponse.json(
        { error: 'Failed to deduct credits' },
        { status: 500 }
      )
    }

    // Record the credit transaction
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -1,
      type: 'usage',
      video_id: video.id,
      description: `Video generation: ${trimmedPrompt.slice(0, 50)}`,
    })

    // Submit to fal.ai queue
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    try {
      const result = await fal.queue.submit(FAL_MODEL, {
        input: {
          prompt: enhancedPrompt,
          duration: '5',
          aspect_ratio: '16:9',
        },
        webhookUrl: `${appUrl}/api/fal-webhook`,
      })

      // Save fal request_id
      await supabase
        .from('videos')
        .update({ fal_request_id: result.request_id })
        .eq('id', video.id)
    } catch (falError) {
      console.error('fal.ai submission error:', falError)
      // Mark video as failed but keep the record
      await supabase
        .from('videos')
        .update({ status: 'failed', error_message: 'Failed to submit to video generation service' })
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
