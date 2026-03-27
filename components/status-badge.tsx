import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VideoStatus } from '@/types'

interface StatusBadgeProps {
  status: VideoStatus
  className?: string
}

const statusConfig: Record<
  VideoStatus,
  { label: string; icon: React.ReactNode; styles: string }
> = {
  pending: {
    label: 'Queued',
    icon: <Clock className="w-3.5 h-3.5" />,
    styles: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  processing: {
    label: 'Generating...',
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    styles: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'Ready',
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    styles: 'bg-green-100 text-green-700 border-green-200',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle className="w-3.5 h-3.5" />,
    styles: 'bg-red-100 text-red-700 border-red-200',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.styles,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
