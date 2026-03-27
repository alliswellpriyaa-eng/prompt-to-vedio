'use client'

import { VideoPlayer } from '@/components/video-player'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, truncate } from '@/lib/utils'
import type { Video } from '@/types'

interface VideoDialogProps {
  video: Video
  onClose: () => void
}

export function VideoDialog({ video, onClose }: VideoDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={video.status} />
            <span className="text-sm text-gray-500">{formatDate(video.created_at)}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {video.status === 'completed' && video.fal_video_url ? (
          <VideoPlayer url={video.fal_video_url} thumbnailUrl={video.fal_thumbnail_url} />
        ) : (
          <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
            <StatusBadge status={video.status} />
          </div>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
              Your Prompt
            </p>
            <p className="text-sm text-gray-700">{video.original_prompt}</p>
          </div>
          {video.enhanced_prompt && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                AI-Enhanced Prompt
              </p>
              <p className="text-sm text-gray-500">{truncate(video.enhanced_prompt, 300)}</p>
            </div>
          )}
          {video.error_message && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{video.error_message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
