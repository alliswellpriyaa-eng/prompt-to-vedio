import Link from 'next/link'
import { Video, Sparkles, Zap, ArrowRight, Check } from 'lucide-react'
import { CREDIT_PACKAGES } from '@/lib/packages'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            PromptToVideo
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          Powered by Kling AI +  Gemini
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mx-auto">
          Turn Your Ideas Into{' '}
          <span className="text-violet-600">Stunning Videos</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
          Type a prompt. Our AI enhances it. Watch your vision come to life in
          minutes. No video editing skills required.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Start Creating Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <span className="text-sm text-gray-400">3 free credits to start</span>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '✍️',
                title: 'Describe Your Vision',
                desc: 'Type a simple text prompt describing the video you want to create.',
              },
              {
                icon: '🤖',
                title: 'AI Enhances It',
                desc: 'Claude AI rewrites your prompt into a cinematic, detail-rich description optimized for video generation.',
              },
              {
                icon: '🎬',
                title: 'Video Is Generated',
                desc: 'Kling AI transforms the enhanced prompt into a high-quality video in 2-5 minutes.',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-gray-200 text-center"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple Pricing</h2>
            <p className="text-gray-500 mt-2">
              Pay for what you use. Start with 3 free credits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border p-6 ${
                  pkg.popular
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{pkg.label}</h3>
                <div className="text-3xl font-extrabold text-gray-900 mt-2">
                  ${(pkg.price / 100).toFixed(2)}
                </div>
                <p className="text-gray-500 text-sm mt-1">{pkg.credits} videos</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    {pkg.credits} AI video credits
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    AI prompt enhancement
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500" />
                    5-second HD videos
                  </li>
                </ul>
                <Link
                  href="/auth/signup"
                  className={`mt-6 block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    pkg.popular
                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-violet-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to create your first video?
          </h2>
          <p className="text-violet-200 mt-3">
            Sign up today and get 3 free credits. No credit card required.
          </p>
          <Link
            href="/auth/signup"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-violet-700 font-semibold rounded-xl transition-colors text-lg"
          >
            <Zap className="w-5 h-5" />
            Start for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
          © 2025 PromptToVideo. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
