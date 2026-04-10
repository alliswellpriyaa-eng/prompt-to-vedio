'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Dashboard error]', error)
  }, [error])

  const isApiError =
    error.message.includes('fal') ||
    error.message.includes('Gemini') ||
    error.message.includes('TTS') ||
    error.message.includes('fetch')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-red-500" />
      </div>

      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
        {isApiError ? 'Service temporarily unavailable' : 'Something went wrong'}
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {isApiError
          ? 'One of our AI services (Fal.ai, Gemini, or TTS) returned an error. Your credits were not deducted. Please try again.'
          : 'An unexpected error occurred. Please try refreshing the page.'}
      </p>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Try again
      </button>

      {error.digest && (
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-600">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
