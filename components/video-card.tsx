'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'
import { VideoDialog } from '@/components/video-dialog'
import { truncate, formatDate } from '@/lib/utils'
import type { Video } from '@/types'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setOpen(true)}
      >
        <div className="relative aspect-video bg-gray-100">
          {video.fal_thumbnail_url ? (
            <Image
              src={video.fal_thumbnail_url}
              alt={video.original_prompt}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <StatusBadge status={video.status} />
            </div>
          )}
          {video.status === 'completed' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Play className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={video.status} />
          </div>
        </div>

        <div className="p-3">
          <p className="text-sm font-medium text-gray-800 line-clamp-2">
            {truncate(video.original_prompt, 80)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{formatDate(video.created_at)}</p>
        </div>
      </div>

      {open && <VideoDialog video={video} onClose={() => setOpen(false)} />}
    </>
  )
}
