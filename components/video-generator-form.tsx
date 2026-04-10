'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2, Video, ChevronDown, ChevronUp, AlertCircle, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { VideoPlayer } from '@/components/video-player'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Video as VideoType } from '@/types'

type GenerationStatus =
  | 'idle'
  | 'uploading'
  | 'enhancing'
  | 'submitting'
  | 'polling'
  | 'done'
  | 'error'

export function VideoGeneratorForm() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState<'5' | '10'>('10')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<GenerationStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [video, setVideo] = useState<VideoType | null>(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null)
  const [showEnhanced, setShowEnhanced] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const pollCountRef = useRef(0)
  const router = useRouter()

  const MAX_CHARS = 500
  const MAX_POLLS = 72 // 72 × 10s = 12 minutes max
  const POLL_INTERVAL = 10000
  const isLoading = status !== 'idle' && status !== 'done' && status !== 'error'

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setUploadedImageUrl(null)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setUploadedImageUrl(null)
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('person-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) throw new Error(`Image upload failed: ${error.message}`)

    const { data } = supabase.storage.from('person-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function pollVideo(id: string) {
    pollCountRef.current = 0
    intervalRef.current = setInterval(async () => {
      pollCountRef.current += 1

      if (pollCountRef.current > MAX_POLLS) {
        clearInterval(intervalRef.current!)
        setError('Video generation is taking too long. Check My Videos page later.')
        setStatus('error')
        return
      }

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
    }, POLL_INTERVAL)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    setStatus('enhancing')
    setError(null)
    setVideo(null)
    setEnhancedPrompt(null)

    try {
      // Upload image if provided
      let imageUrl: string | null = uploadedImageUrl
      if (imageFile) {
        setStatus('uploading')
        try {
          imageUrl = await uploadImage(imageFile)
          setUploadedImageUrl(imageUrl)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Image upload failed')
          setStatus('error')
          return
        }
      }

      setStatus('enhancing')

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), imageUrl, duration }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong.')
        setStatus('error')
        return
      }

      setStatus('polling')
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt)
        setPrompt(data.enhancedPrompt)
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
    setPrompt('')
    setImageFile(null)
    setImagePreview(null)
    setUploadedImageUrl(null)
    setDuration('10')
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prompt */}
        <div className="space-y-2">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Describe your video
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A girl walking in the rain holding an umbrella..."
              maxLength={MAX_CHARS}
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl resize-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Duration + Image upload row */}
        <div className="flex gap-4 flex-wrap">
          {/* Duration */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Duration
            </label>
            <div className="flex gap-2">
              {(['5', '10'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50',
                    duration === d
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300'
                  )}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Person image upload */}
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Person Photo
            </label>
            {imagePreview ? (
              <div className="relative inline-flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                <Image
                  src={imagePreview}
                  alt="Person preview"
                  width={48}
                  height={48}
                  className="rounded-lg object-cover w-12 h-12"
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 max-w-[120px] truncate">
                  {imageFile?.name}
                </span>
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={cn(
                'inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:border-violet-400 hover:text-violet-600 transition-colors',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}>
                <Upload className="w-4 h-4" />
                Upload photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isLoading}
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {status === 'uploading'
                ? 'Uploading photo...'
                : status === 'enhancing' || status === 'submitting'
                  ? 'Enhancing your prompt...'
                  : 'Generating video (2-5 min)...'}
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              Generate Video
            </>
          )}
        </button>
      </form>

      {/* Enhanced prompt */}
      {enhancedPrompt && (
        <div className="border border-violet-200 dark:border-violet-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowEnhanced(!showEnhanced)}
            className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 dark:bg-violet-950 text-sm font-medium text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI-Enhanced Prompt
            </span>
            {showEnhanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showEnhanced && (
            <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800">{enhancedPrompt}</div>
          )}
        </div>
      )}

      {/* Polling progress */}
      {status === 'polling' && !video && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="w-16 h-16 rounded-full border-4 border-violet-100 dark:border-violet-900 border-t-violet-600 animate-spin" />
          <div className="text-center">
            <p className="font-medium text-gray-800 dark:text-gray-200">Generating your video</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
            <h3 className="font-semibold text-gray-900 dark:text-white">Your video is ready!</h3>
            <button onClick={handleReset} className="text-sm text-violet-600 hover:underline">
              Generate another
            </button>
          </div>
          <VideoPlayer url={video.fal_video_url} thumbnailUrl={video.fal_thumbnail_url} />
        </div>
      )}

      {/* Error state */}
      {status === 'error' && error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
            <button onClick={handleReset} className="text-sm text-red-600 hover:underline mt-1">
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
