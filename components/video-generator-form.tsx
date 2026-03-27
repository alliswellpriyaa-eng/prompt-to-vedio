'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, Video, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { VideoPlayer } from '@/components/video-player'
import { cn } from '@/lib/utils'
import type { Video as VideoType } from '@/types'

type GenerationStatus =
  | 'idle'
  | 'enhancing'
  | 'submitting'
  | 'polling'
  | 'done'
  | 'error'

interface VideoGeneratorFormProps {
  credits: number
}

export function VideoGeneratorForm({ credits }: VideoGeneratorFormProps) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoType | null>(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null)
  const [showEnhanced, setShowEnhanced] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const router = useRouter()

  const MAX_CHARS = 500
  const isLoading = status !== 'idle' && status !== 'done' && status !== 'error'

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  async function pollVideo(id: string) {
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/videos/${id}`)
        if (!res.ok) return
        const data: VideoType = await res.json()

        if (data.status === 'completed') {
          clearInterval(intervalRef.current!)
          setVideo(data)
          setStatus('done')
          router.refresh()
        } else if (data.status === 'failed') {
          clearInterval(intervalRef.current!)
          setError(data.error_message || 'Video generation failed. Please try again.')
          setStatus('error')
        }
      } catch {
        // keep polling
      }
    }, 5000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    setStatus('enhancing')
    setError(null)
    setVideo(null)
    setEnhancedPrompt(null)
    setVideoId(null)

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus('polling')
      setVideoId(data.videoId)
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt)
        setShowEnhanced(true)
      }
      pollVideo(data.videoId)
    } catch {
      setError('Network error. Please check your connection.')
      setStatus('error')
    }
  }

  function handleReset() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setStatus('idle')
    setError(null)
    setVideo(null)
    setEnhancedPrompt(null)
    setVideoId(null)
    setPrompt('')
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700"
          >
            Describe your video
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A majestic eagle soaring over snow-capped mountains at golden hour..."
              maxLength={MAX_CHARS}
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div
              className={cn(
                'absolute bottom-3 right-3 text-xs',
                prompt.length > MAX_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {prompt.length}/{MAX_CHARS}
            </div>
          </div>
        </div>

        {credits === 0 ? (
          <a
            href="/billing"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
          >
            Buy Credits to Generate
          </a>
        ) : (
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading || credits < 1}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {status === 'enhancing' || status === 'submitting'
                  ? 'Enhancing your prompt...'
                  : 'Generating video (2-5 min)...'}
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Generate Video <span className="opacity-70 text-sm font-normal">(1 credit)</span>
              </>
            )}
          </button>
        )}
      </form>

      {/* Enhanced prompt reveal */}
      {enhancedPrompt && (
        <div className="border border-violet-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowEnhanced(!showEnhanced)}
            className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 text-sm font-medium text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI-Enhanced Prompt
            </span>
            {showEnhanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showEnhanced && (
            <div className="px-4 py-3 text-sm text-gray-600 bg-white">
              {enhancedPrompt}
            </div>
          )}
        </div>
      )}

      {/* Polling progress */}
      {status === 'polling' && !video && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 border border-gray-200 rounded-xl bg-gray-50">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-medium text-gray-800">Generating your video</p>
            <p className="text-sm text-gray-500 mt-1">
              This usually takes 2-5 minutes. You can leave and come back.
            </p>
            <a href="/videos" className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              View all my videos
            </a>
          </div>
        </div>
      )}

      {/* Video result */}
      {status === 'done' && video?.fal_video_url && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Your video is ready!</h3>
            <button
              onClick={handleReset}
              className="text-sm text-violet-600 hover:underline"
            >
              Generate another
            </button>
          </div>
          <VideoPlayer url={video.fal_video_url} thumbnailUrl={video.fal_thumbnail_url} />
        </div>
      )}

      {/* Error state */}
      {status === 'error' && error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={handleReset}
              className="text-sm text-red-600 hover:underline mt-1"
            >
              Try again
            </button>
            {error.includes('credits') && (
              <a
                href="/billing"
                className="text-sm text-violet-600 hover:underline ml-4"
              >
                Buy credits
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
