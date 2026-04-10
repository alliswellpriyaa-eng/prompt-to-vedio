import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fal, getFalModel } from '@/lib/fal'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: video, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // If still processing and has a fal request_id, check fal.ai directly
    if (video.status === 'processing' && video.fal_request_id) {
      try {
        const falModel = getFalModel(video.image_url)
        const falStatus = await fal.queue.status(falModel, {
          requestId: video.fal_request_id,
          logs: false,
        })

        if (falStatus.status === 'COMPLETED') {
          const result = await fal.queue.result(falModel, {
            requestId: video.fal_request_id,
          })

          const output = result.data as { video?: { url: string; thumbnail_url?: string } }
          const videoUrl = output?.video?.url
          const thumbnailUrl = output?.video?.thumbnail_url || null

          if (videoUrl) {
            await supabase
              .from('videos')
              .update({
                status: 'completed',
                fal_video_url: videoUrl,
                fal_thumbnail_url: thumbnailUrl,
              })
              .eq('id', id)

            return NextResponse.json({
              ...video,
              status: 'completed',
              fal_video_url: videoUrl,
              fal_thumbnail_url: thumbnailUrl,
            })
          }
        }

      } catch (falError) {
        console.error('fal.ai status check error:', falError)
        // Return current DB status if fal check fails
      }
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('video GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('video DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
