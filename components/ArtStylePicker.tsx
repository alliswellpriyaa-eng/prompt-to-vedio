'use client'

import { cn } from '@/lib/utils'

export const ART_STYLES = [
  {
    value: 'watercolor animation style, warm earthy colors, soft painted look',
    label: 'Watercolor',
    emoji: '🎨',
  },
  {
    value: '3D cartoon style, bright vivid colors, smooth character animation, Pixar quality rendering',
    label: '3D Cartoon',
    emoji: '🎬',
  },
  {
    value: 'traditional folk art style, flat illustration, bold outlines, vibrant patterns',
    label: 'Folk Art',
    emoji: '🖼️',
  },
  {
    value: 'cinematic movie style, rich warm tones, dramatic lighting, lush color grading',
    label: 'Cinematic',
    emoji: '✨',
  },
]

interface ArtStylePickerProps {
  value: string
  onChange: (style: string) => void
  disabled?: boolean
}

export function ArtStylePicker({ value, onChange, disabled }: ArtStylePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ART_STYLES.map((style) => (
        <button
          key={style.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(style.value)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors text-left disabled:opacity-50',
            value === style.value
              ? 'bg-violet-600 text-white border-violet-600'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-violet-300'
          )}
        >
          <span>{style.emoji}</span>
          <span>{style.label}</span>
        </button>
      ))}
    </div>
  )
}
