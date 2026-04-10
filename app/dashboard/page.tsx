import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardTabs } from '@/components/dashboard-tabs'
import type { Video } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: recentVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return <DashboardTabs recentVideos={(recentVideos as Video[]) ?? []} />
}
