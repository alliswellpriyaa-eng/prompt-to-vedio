import type { CreditPackage } from '@/types'

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    credits: 10,
    price: 500,
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter',
    label: 'Starter',
  },
  {
    id: 'pro',
    credits: 35,
    price: 1500,
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro',
    label: 'Pro',
    popular: true,
  },
  {
    id: 'studio',
    credits: 80,
    price: 3000,
    priceId: process.env.STRIPE_PRICE_STUDIO || 'price_studio',
    label: 'Studio',
  },
]

export function getPackageById(id: string) {
  return CREDIT_PACKAGES.find((p) => p.id === id)
}
