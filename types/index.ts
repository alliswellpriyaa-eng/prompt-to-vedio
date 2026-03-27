export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed'

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
  status: VideoStatus
  duration_seconds: number
  credits_used: number
  error_message: string | null
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
}

export interface GenerateVideoResponse {
  videoId: string
  status: VideoStatus
  enhancedPrompt?: string
}

export interface CheckoutRequest {
  packageId: string
}

export interface CheckoutResponse {
  url: string
}
