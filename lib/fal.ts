import { fal } from '@fal-ai/client'

fal.config({
  credentials: process.env.FAL_KEY,
})

export { fal }

export const FAL_MODEL = 'fal-ai/kling-video/v1.6/standard/text-to-video'

export interface FalVideoInput {
  prompt: string
  duration?: '5' | '10'
  aspect_ratio?: '16:9' | '9:16' | '1:1'
}

export interface FalVideoOutput {
  video: {
    url: string
    file_name?: string
    file_size?: number
    content_type?: string
  }
}
