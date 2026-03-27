import { createClient } from '@supabase/supabase-js'

// Use only in server-side API routes that need to bypass RLS
// (Stripe webhook, fal webhook)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
