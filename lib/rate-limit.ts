import type { SupabaseClient } from '@supabase/supabase-js'

// Quick video: max 5 submissions per 10 minutes per user
// Story video: max 2 submissions per 60 minutes per user
const LIMITS = {
  quick: { maxRequests: 5, windowMinutes: 10 },
  story: { maxRequests: 2, windowMinutes: 60 },
} as const

interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds?: number
}

export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  videoType: 'quick' | 'story'
): Promise<RateLimitResult> {
  const { maxRequests, windowMinutes } = LIMITS[videoType]
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('video_type', videoType)
    .gte('created_at', windowStart)

  // On DB error, fail open — don't block the user
  if (error) {
    console.error('[rate-limit] DB error, failing open:', error.message)
    return { allowed: true }
  }

  if ((count ?? 0) >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: windowMinutes * 60,
    }
  }

  return { allowed: true }
}
