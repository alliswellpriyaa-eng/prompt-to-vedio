import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { request_id, status, payload, error } = body

    if (!request_id) {
      return NextResponse.json({ error: 'Missing request_id' }, { status: 400 })
    }

    const supabase = createServiceClient()

    if (status === 'OK' && payload?.video?.url) {
      await supabase
        .from('videos')
        .update({
          status: 'completed',
          fal_video_url: payload.video.url,
          fal_thumbnail_url: payload.video.thumbnail_url || null,
        })
        .eq('fal_request_id', request_id)
    } else {
      await supabase
        .from('videos')
        .update({
          status: 'failed',
          error_message: error?.message || 'Video generation failed',
        })
        .eq('fal_request_id', request_id)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('fal-webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
