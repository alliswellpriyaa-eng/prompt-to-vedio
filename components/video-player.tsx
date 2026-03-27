'use client'

import { Download, Link } from 'lucide-react'
import { useState } from 'react'

interface VideoPlayerProps {
  url: string
  thumbnailUrl?: string | null
}

export function VideoPlayer({ url, thumbnailUrl }: VideoPlayerProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video
          src={url}
          poster={thumbnailUrl || undefined}
          controls
          preload="metadata"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="flex gap-2">
        <a
          href={url}
          download
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
        <button
          onClick={copyLink}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Link className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}
