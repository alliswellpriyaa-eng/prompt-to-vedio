import { fal } from '@fal-ai/client'

fal.config({
  credentials: process.env.FAL_KEY,
})

export { fal }

export const FAL_TEXT_TO_VIDEO = 'fal-ai/kling-video/v2.1/standard/text-to-video'
export const FAL_IMAGE_TO_VIDEO = 'fal-ai/kling-video/v2.1/standard/image-to-video'

export interface FalVideoInput {
  prompt: string
  duration?: '5' | '10'
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  cfg_scale?: number
  negative_prompt?: string
  image_url?: string
}

export interface FalVideoOutput {
  video: {
    url: string
    file_name?: string
    file_size?: number
    content_type?: string
  }
}

export function getFalModel(imageUrl?: string | null): string {
  return imageUrl ? FAL_IMAGE_TO_VIDEO : FAL_TEXT_TO_VIDEO
}
