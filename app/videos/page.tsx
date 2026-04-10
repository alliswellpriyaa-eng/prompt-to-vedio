import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { VideoCard } from '@/components/video-card'
import type { Video } from '@/types'

export default async function VideosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: videos, count } = await supabase
    .from('videos')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(24)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Videos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {count ?? 0} video{(count ?? 0) !== 1 ? 's' : ''} generated
          </p>
        </div>
      </div>

      {!videos || videos.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🎬</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            No videos yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Go to the dashboard to generate your first AI video.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(videos as Video[]).map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}