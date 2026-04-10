// /lib/generate-story-clips.ts
// Updated with character consistency improvements
// Key change: forces image-to-video on ALL scenes when personImageUrl exists
// This is the single biggest fix for character drift

import { fal } from '@/lib/fal'
import type { Scene } from '@/types'

const BATCH_SIZE = 3

// ✅ Updated to v2.1 standard — 60% cheaper than v2.6 pro
// Same visual quality for kids cartoon content
export const FAL_TEXT_TO_VIDEO =
  'fal-ai/kling-video/v2.1/standard/text-to-video'
export const FAL_IMAGE_TO_VIDEO =
  'fal-ai/kling-video/v2.1/standard/image-to-video'

interface KlingVideoOutput {
  data: {
    video?: {
      url: string
      file_name?: string
      file_size?: number
      content_type?: string
    }
  }
}

async function generateClip(
  scene: Scene,
  personImageUrl: string | null
): Promise<string> {
  // ✅ KEY FIX: If ANY reference image exists, use it for EVERY scene
  // This is the most effective way to maintain character consistency
  // Old behaviour: only use image when scene.usePersonImage === true
  // New behaviour: use image for ALL scenes when image is available
  const useImage = !!personImageUrl
  const endpoint = useImage ? FAL_IMAGE_TO_VIDEO : FAL_TEXT_TO_VIDEO

  const input: Record<string, unknown> = {
    prompt: scene.videoPrompt,
    duration: '10',
    aspect_ratio: '16:9',
    cfg_scale: 0.5,
    negative_prompt:
      'blur, distort, low quality, western style, watermark, text, ' +
      'multiple characters, deformed face, inconsistent character, ' +
      'different character, character change',
  }

  if (useImage && personImageUrl) {
    input.image_url = personImageUrl
  }

  try {
    const result = (await fal.subscribe(endpoint, {
      input,
      logs: false,
    })) as unknown as KlingVideoOutput

    const videoUrl = result?.data?.video?.url
    if (!videoUrl) {
      throw new Error(`No video URL returned for scene ${scene.sceneNumber}`)
    }

    console.log(
      `✅ Scene ${scene.sceneNumber} — ${useImage ? 'image-to-video' : 'text-to-video'}`
    )

    return videoUrl
  } catch (e) {
    const err = e as { message?: string; status?: number; body?: unknown }
    const detail = JSON.stringify(err.body ?? err.message ?? e)
    throw new Error(
      `fal.ai scene ${scene.sceneNumber} (status ${err.status ?? '?'}): ${detail}`
    )
  }
}

export async function generateStoryClips(
  scenes: Scene[],
  personImageUrl: string | null
): Promise<string[]> {
  console.log(
    `🎬 Generating ${scenes.length} clips — ` +
      `mode: ${personImageUrl ? 'image-to-video (consistent)' : 'text-to-video'}`
  )

  const videoUrls: string[] = new Array(scenes.length)

  for (let i = 0; i < scenes.length; i += BATCH_SIZE) {
    const batch = scenes.slice(i, i + BATCH_SIZE)
    console.log(
      `📦 Batch ${Math.floor(i / BATCH_SIZE) + 1} — scenes ${i + 1} to ${i + batch.length}`
    )

    const batchResults = await Promise.all(
      batch.map(async (scene, batchIndex) => {
        const url = await generateClip(scene, personImageUrl)
        return { index: i + batchIndex, url }
      })
    )

    for (const { index, url } of batchResults) {
      videoUrls[index] = url
    }
  }

  return videoUrls
}