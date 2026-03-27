import Link from 'next/link'
import { CheckCircle, Sparkles } from 'lucide-react'

export default function BillingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="text-gray-500 mt-3 text-sm leading-relaxed">
          Your credits have been added to your account. It may take a few moments to
          reflect your new balance.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Start Generating Videos
          </Link>
          <Link
            href="/billing"
            className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors text-sm"
          >
            View Billing History
          </Link>
        </div>
      </div>
    </div>
  )
}
