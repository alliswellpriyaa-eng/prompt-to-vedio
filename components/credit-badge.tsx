import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditBadgeProps {
  credits: number
  className?: string
}

export function CreditBadge({ credits, className }: CreditBadgeProps) {
  const color =
    credits === 0
      ? 'bg-red-100 text-red-700 border-red-200'
      : credits <= 5
        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
        : 'bg-green-100 text-green-700 border-green-200'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border',
        color,
        className
      )}
    >
      <Coins className="w-4 h-4" />
      {credits} {credits === 1 ? 'credit' : 'credits'}
    </span>
  )
}
