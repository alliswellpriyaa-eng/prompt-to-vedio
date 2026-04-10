'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Film } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function VideosError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Videos page error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
        Failed to load your videos
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        We couldn&apos;t fetch your video library. This is usually a temporary issue.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
        >
          <Film className="w-4 h-4" />
          Go to dashboard
        </Link>
      </div>

      {error.digest && (
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
