'use client'

import { useState } from 'react'
import { VideoGeneratorForm } from '@/components/video-generator-form'
import { StoryVideoForm } from '@/components/story-video-form'
import { VideoCard } from '@/components/video-card'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Video } from '@/types'

interface DashboardTabsProps {
  recentVideos: Video[]
}

export function DashboardTabs({ recentVideos }: DashboardTabsProps) {
  const [mode, setMode] = useState<'quick' | 'story'>('quick')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Create AI-generated videos from stories
        </p>
      </div>

      {/* Tab switcher */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setMode('quick')}
            className={cn(
              'flex-1 py-3.5 text-sm font-semibold transition-colors',
              mode === 'quick'
                ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-b-2 border-violet-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            ⚡ Quick Video
          </button>
          <button
            onClick={() => setMode('story')}
            className={cn(
              'flex-1 py-3.5 text-sm font-semibold transition-colors',
              mode === 'story'
                ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-b-2 border-violet-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            📖 Story Video
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6 sm:p-8">
          {mode === 'quick' ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Generate a Quick Video
              </h2>
              <VideoGeneratorForm />
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Generate a Story Video
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Paste your story. AI breaks it into 6 scenes with voiceover and stitches a ~60s video.
              </p>
              <StoryVideoForm />
            </>
          )}
        </div>
      </div>

      {/* Recent videos */}
      {recentVideos.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Videos
            </h2>
            <Link href="/videos" className="text-sm text-violet-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
