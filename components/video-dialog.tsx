'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { VideoPlayer } from '@/components/video-player'
import { StatusBadge } from '@/components/status-badge'
import { formatDate, truncate } from '@/lib/utils'
import type { Video } from '@/types'

interface VideoDialogProps {
  video: Video
  onClose: () => void
  onDelete?: (id: string) => void
}

export function VideoDialog({ video, onClose, onDelete }: VideoDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
      if (res.ok) {
        onDelete?.(video.id)
        onClose()
      }
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={video.status} />
            <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(video.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete button */}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                confirmDelete
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
              }`}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {confirmDelete ? 'Confirm delete' : 'Delete'}
            </button>
            {confirmDelete && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none ml-1"
            >
              &times;
            </button>
          </div>
        </div>

        {video.status === 'completed' && video.fal_video_url ? (
          <VideoPlayer url={video.fal_video_url} thumbnailUrl={video.fal_thumbnail_url} />
        ) : (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <StatusBadge status={video.status} />
          </div>
        )}

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
              Your Prompt
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{video.original_prompt}</p>
          </div>
          {video.enhanced_prompt && (
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                AI-Enhanced Prompt
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{truncate(video.enhanced_prompt, 300)}</p>
            </div>
          )}
          {video.error_message && (
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{video.error_message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
