'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  Loader2,
  BookOpen,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react'

import { ArtStylePicker, ART_STYLES } from '@/components/ArtStylePicker'
import { VideoPlayer } from '@/components/video-player'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { GenerateStoryVideoResponse } from '@/types'

type StoryStatus =

  | 'idle'
  | 'uploading'
  | 'generating'
  | 'done'
  | 'error'

export function StoryVideoForm() {
  const [story, setStory] = useState('')
  const [characterName, setCharacterName] = useState('')
  const [artStyle, setArtStyle] = useState(ART_STYLES[0].value)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<StoryStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const isLoading = status === 'uploading' || status === 'generating'
  const MAX_STORY_CHARS = 3000

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
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadImage(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('person-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (uploadErr) throw new Error(`Image upload failed: ${uploadErr.message}`)

    const { data } = supabase.storage.from('person-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!story.trim() || !characterName.trim() || isLoading) return

    setStatus('uploading')
    setError(null)
    setVideoUrl(null)

    try {
      let personImageUrl: string | undefined = uploadedImageUrl ?? undefined
      if (imageFile) {
        personImageUrl = await uploadImage(imageFile)
        setUploadedImageUrl(personImageUrl)
      }

      setStatus('generating')

      const res = await fetch('/api/generate-story-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          story: story.trim(),
          characterName: characterName.trim(),
          artStyle,
          personImageUrl,
        }),
      })

      const data = (await res.json()) as GenerateStoryVideoResponse & { error?: string }

      if (!res.ok) {
        setError(data.error || 'Story video generation failed.')
        setStatus('error')
        return
      }

      setVideoUrl(data.videoUrl ?? null)
      setStatus('done')
    } catch {
      setError('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  function handleReset() {
    setStatus('idle')
    setError(null)
    setVideoUrl(null)
    setStory('')
    setCharacterName('')
    setArtStyle(ART_STYLES[0].value)
    removeImage()
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Story input */}
        <div className="space-y-2">
          <label htmlFor="story" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Story text
          </label>
          <div className="relative">
            <textarea
              id="story"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Once upon a time, Ravi the clever rabbit lived near a big pond..."
              maxLength={MAX_STORY_CHARS}
              rows={6}
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl resize-none text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div
              className={cn(
                'absolute bottom-3 right-3 text-xs',
                story.length > MAX_STORY_CHARS * 0.9 ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {story.length}/{MAX_STORY_CHARS}
            </div>
          </div>
        </div>

        {/* Character name */}
        <div className="space-y-2">
          <label htmlFor="characterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Main character name
          </label>
          <input
            id="characterName"
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="e.g. Ravi, Birbal, Tenali"
            maxLength={50}
            disabled={isLoading}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* Language + Art Style row */}
        <div className="grid sm:grid-cols-2 gap-5">

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Animation style
            </label>
            <ArtStylePicker value={artStyle} onChange={setArtStyle} disabled={isLoading} />
          </div>
        </div>

        {/* Character photo upload */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Character photo{' '}
            <span className="normal-case text-gray-400 dark:text-gray-500 font-normal">(optional — for consistent face across scenes)</span>
          </label>
          {imagePreview ? (
            <div className="inline-flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
              <Image
                src={imagePreview}
                alt="Character preview"
                width={48}
                height={48}
                className="rounded-lg object-cover w-12 h-12"
              />
              <span className="text-xs text-gray-600 dark:text-gray-300 max-w-[140px] truncate">
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
            <label
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:border-violet-400 hover:text-violet-600 transition-colors',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Upload className="w-4 h-4" />
              Upload character photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isLoading}
                onChange={handleImageChange}
              />
            </label>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Best results: clear, well-lit photo, character takes up most of the frame
          </p>
        </div>

        <button
          type="submit"
          disabled={!story.trim() || !characterName.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {status === 'uploading'
                ? 'Uploading photo...'
                : 'Generating story video (10-15 min)...'}
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" />
              Generate Story Video
            </>
          )}
        </button>
      </form>

      {/* Generating state */}
      {status === 'generating' && (
        <div className="flex flex-col items-center justify-center py-10 gap-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="w-16 h-16 rounded-full border-4 border-violet-100 dark:border-violet-900 border-t-violet-600 animate-spin" />
          <div className="text-center space-y-1">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              Creating your story video
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Planning scenes → Generating 6 clips → Adding voiceover → Stitching
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              This takes 10-15 minutes. Please keep this tab open.
            </p>
            <a
              href="/videos"
              className="text-sm text-violet-600 hover:underline mt-2 inline-flex items-center gap-1"
            >
              Check My Videos
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Done state */}
      {status === 'done' && videoUrl && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Your story video is ready!
              </h3>
            </div>
            <button onClick={handleReset} className="text-sm text-violet-600 hover:underline">
              Create another
            </button>
          </div>
          <VideoPlayer url={videoUrl} />
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
