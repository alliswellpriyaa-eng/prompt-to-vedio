import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreditBadgeProps {
  credits: number
  className?: string
}

export function CreditBadge({ credits, className }: CreditBadgeProps) {
  const color =
    credits === 0
      ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
      : credits <= 5
        ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
        : 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'

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
