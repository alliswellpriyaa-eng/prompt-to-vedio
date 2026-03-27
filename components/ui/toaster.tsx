'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type?: 'success' | 'error' | 'info'
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let toastQueue: Toast[] = []

export function toast(message: string, type: Toast['type'] = 'info') {
  const id = Math.random().toString(36).slice(2)
  toastQueue = [...toastQueue, { id, message, type }]
  toastListeners.forEach((l) => l(toastQueue))
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    toastListeners.forEach((l) => l(toastQueue))
  }, 4000)
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListeners.push(setToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts)
    }
  }, [])

  function dismiss(id: string) {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    toastListeners.forEach((l) => l(toastQueue))
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm',
            t.type === 'error' && 'bg-red-600 text-white',
            t.type === 'success' && 'bg-green-600 text-white',
            (!t.type || t.type === 'info') && 'bg-gray-900 text-white'
          )}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)}>
            <X className="w-4 h-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      ))}
    </div>
  )
}
