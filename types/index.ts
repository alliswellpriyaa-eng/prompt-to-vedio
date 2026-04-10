export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type VideoType = 'quick' | 'story'

export interface Scene {
  sceneNumber: number
  narration: string
  videoPrompt: string
  usePersonImage: boolean
  duration: '10'
}

export interface Profile {
  id: string
  email: string
  credits: number
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  user_id: string
  original_prompt: string
  enhanced_prompt: string | null
  fal_request_id: string | null
  fal_video_url: string | null
  fal_thumbnail_url: string | null
  image_url: string | null
  duration: '5' | '10'
  status: VideoStatus
  duration_seconds: number
  credits_used: number
  error_message: string | null
  video_type: VideoType
  scenes: Scene[] | null
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage'
  stripe_payment_intent_id: string | null
  video_id: string | null
  description: string | null
  created_at: string
}

export interface CreditPackage {
  id: string
  credits: number
  price: number
  priceId: string
  label: string
  popular?: boolean
}

export interface GenerateVideoRequest {
  prompt: string
  imageUrl?: string
  duration?: '5' | '10'
}

export interface GenerateVideoResponse {
  videoId: string
  status: VideoStatus
  enhancedPrompt?: string
}

export interface GenerateStoryVideoRequest {
  story: string
  characterName: string
  artStyle: string
  personImageUrl?: string
}

export interface GenerateStoryVideoResponse {
  videoId: string
  status: VideoStatus
  scenes?: Scene[]
  videoUrl?: string
}

export interface CheckoutRequest {
  packageId: string
}

export interface CheckoutResponse {
  url: string
}
