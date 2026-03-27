import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { CreditBadge } from '@/components/credit-badge'
import { CreditPackageCard } from '@/components/credit-package-card'
import { CREDIT_PACKAGES } from '@/lib/packages'
import { formatDate } from '@/lib/utils'
import type { CreditTransaction } from '@/types'

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [{ data: profile }, { data: transactions }] = await Promise.all([
    supabase.from('profiles').select('credits, email').eq('id', user.id).single(),
    supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar credits={profile?.credits ?? 0} email={profile?.email} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Credits</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your video generation credits</p>
          </div>
          <CreditBadge credits={profile?.credits ?? 0} />
        </div>

        {/* Credit packages */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Purchase Credits</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <CreditPackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
          {!transactions || transactions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-sm">
              No transactions yet.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {(transactions as CreditTransaction[]).map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3 text-gray-500">{formatDate(tx.created_at)}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {tx.description || (tx.type === 'purchase' ? 'Credit purchase' : 'Video generation')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            tx.amount > 0
                              ? 'text-green-600 font-semibold'
                              : 'text-red-500'
                          }
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
