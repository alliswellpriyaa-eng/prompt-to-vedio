// /app/api/generate-story-video/route.ts
// Updated to use new generateStoryScenes with character consistency

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateStoryScenes } from '@/lib/story-agent'
import { generateStoryClips } from '@/lib/generate-story-clips'
import { generateVoiceover } from '@/lib/voiceover'
import { stitchStoryVideo } from '@/lib/stitch-video'
import { checkRateLimit } from '@/lib/rate-limit'

const STORY_CREDIT_COST = 10

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  let videoId: string | null = null

  try {
    // ── Auth ────────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────
    const body = await req.json()
    const {
      story,
      characterName,
      artStyle = 'chhota_bheem',
      personImageUrl = null,
    } = body as {
      story: string
      characterName: string
      artStyle: string
      personImageUrl: string | null
    }

    if (!story?.trim() || !characterName?.trim()) {
      return NextResponse.json(
        { error: 'Story and character name are required' },
        { status: 400 }
      )
    }

    // ── Rate limit: 2 story videos per 60 minutes ───────────
    const rateLimit = await checkRateLimit(supabase, user.id, 'story')
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many requests. You can generate up to 2 story videos per hour. Please wait ${Math.ceil((rateLimit.retryAfterSeconds ?? 3600) / 60)} minutes.`,
        },
        { status: 429 }
      )
    }

    // ── Check credits ────────────────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < STORY_CREDIT_COST) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 402 }
      )
    }

    // ── Deduct credits BEFORE generation ────────────────────
    await supabase
      .from('profiles')
      .update({ credits: profile.credits - STORY_CREDIT_COST })
      .eq('id', user.id)

    // ── Create pending video record ──────────────────────────
    const { data: videoRecord } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        prompt: story,
        video_type: 'story',
        status: 'processing',
        image_url: personImageUrl ?? null,
      })
      .select('id')
      .single()

    videoId = videoRecord?.id ?? null

    // ── Step 1: Generate scenes with character consistency ───
    console.log('📝 Generating story scenes...')
    const { scenes, characterDesc } = await generateStoryScenes(
      story,
      characterName,
      artStyle,
      !!personImageUrl
    )

    // Save scenes to video record
    if (videoId) {
      await supabase
        .from('videos')
        .update({ scenes })
        .eq('id', videoId)
    }

    // ── Step 2: Generate video clips ─────────────────────────
    console.log('🎬 Generating video clips...')
    const videoUrls = await generateStoryClips(scenes, personImageUrl)

    // ── Step 3: Generate voiceovers ──────────────────────────
    console.log('🎙️ Generating voiceovers...')
    const voiceBuffers = await Promise.all(
      scenes.map((scene) => generateVoiceover(scene.narration))
    )

    // Debug — log voiceover sizes
    voiceBuffers.forEach((buf, i) => {
      console.log(`Voice scene ${i + 1}: ${buf?.length ?? 0} bytes`)
    })

    // ── Step 4: Stitch final video ────────────────────────────
    console.log('🎞️ Stitching final video...')
    const finalVideoUrl = await stitchStoryVideo(videoUrls, voiceBuffers, user.id)

    // ── Step 5: Save completed video ─────────────────────────
    if (videoId) {
      await supabase
        .from('videos')
        .update({
          video_url: finalVideoUrl,
          status: 'completed',
          // Store character desc for future use / debugging
          enhanced_prompt: characterDesc,
        })
        .eq('id', videoId)
    }

    console.log('✅ Story video complete!')

    return NextResponse.json({
      videoUrl: finalVideoUrl,
      scenes,
      characterDesc,
    })
  } catch (error) {
    console.error('Story video generation error:', error)

    // Mark the video record as failed so the user sees the correct state
    if (videoId) {
      try {
        await supabase
          .from('videos')
          .update({
            status: 'failed',
            error_message:
              error instanceof Error ? error.message : 'Video generation failed',
          })
          .eq('id', videoId)
      } catch {
        // ignore secondary error
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Video generation failed',
      },
      { status: 500 }
    )
  }
}
