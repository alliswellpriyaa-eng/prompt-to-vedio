import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoGeneratorForm } from '@/components/video-generator-form'
import { VideoCard } from '@/components/video-card'
import { CreditBadge } from '@/components/credit-badge'
import Link from 'next/link'
import type { Video } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: profile }, { data: recentVideos }] = await Promise.all([
    supabase.from('profiles').select('credits').eq('id', user.id).single(),
    supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const credits = profile?.credits ?? 0

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Create AI-generated videos from text</p>
        </div>
        <CreditBadge credits={credits} />
      </div>

      {/* Generator */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Generate a Video</h2>
        <VideoGeneratorForm credits={credits} />
      </div>

      {/* Recent videos */}
      {recentVideos && recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Videos</h2>
            <Link
              href="/videos"
              className="text-sm text-violet-600 hover:underline font-medium"
            >
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(recentVideos as Video[]).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}

      {credits === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="font-semibold text-amber-900">You&apos;re out of credits</p>
            <p className="text-sm text-amber-700 mt-1">
              Purchase more credits to keep generating videos.
            </p>
          </div>
          <Link
            href="/billing"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors shrink-0"
          >
            Buy Credits
          </Link>
        </div>
      )}
    </div>
  )
}
