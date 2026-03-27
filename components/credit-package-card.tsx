'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreditPackage } from '@/types'

interface CreditPackageCardProps {
  pkg: CreditPackage
}

export function CreditPackageCard({ pkg }: CreditPackageCardProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handlePurchase() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id }),
      })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'relative rounded-2xl border p-6 flex flex-col gap-4',
        pkg.popular
          ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-100'
          : 'border-gray-200 bg-white'
      )}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-gray-900">{pkg.label}</h3>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-extrabold text-gray-900">
            ${(pkg.price / 100).toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {pkg.credits} AI videos &bull; ${((pkg.price / 100) / pkg.credits).toFixed(2)}/video
        </p>
      </div>

      <button
        onClick={handlePurchase}
        disabled={loading}
        className={cn(
          'mt-auto w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
          pkg.popular
            ? 'bg-violet-600 hover:bg-violet-700 text-white'
            : 'bg-gray-900 hover:bg-gray-800 text-white'
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading...
          </>
        ) : (
          'Buy Now'
        )}
      </button>
    </div>
  )
}
