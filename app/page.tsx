import Link from 'next/link'
import { BookOpen, Sparkles, Zap, ArrowRight, Check, Mic } from 'lucide-react'
import { CREDIT_PACKAGES } from '@/lib/packages'
import { ThemeToggle } from '@/components/theme-toggle'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            StoryReel
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
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

        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight max-w-4xl mx-auto">
          Turn Your Stories Into{' '}
          <span className="text-violet-600">YouTube-Ready Videos</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Paste any kids story. AI breaks it into scenes,
          generates animation clips, adds multilingual voiceover — ready in minutes.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            Start Creating Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <span className="text-sm text-gray-400 dark:text-gray-500">3 free credits · No card required</span>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: '📖',
                title: 'Paste Your Story',
                desc: 'Paste any kids story — fairy tales, fables, moral stories, or your own original.',
              },
              {
                icon: '🤖',
                title: 'AI Plans 6 Scenes',
                desc: 'Gemini breaks your story into 6 cinematic scenes with narration and visual prompts.',
              },
              {
                icon: '🎬',
                title: 'Clips Generated',
                desc: 'Kling AI generates 6 animated video clips in your chosen art style.',
              },
              {
                icon: '🎙️',
                title: 'Voiceover + Stitch',
                desc: 'Google TTS adds multilingual narration. FFmpeg stitches everything into one ~60s video.',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Built for Creators Worldwide
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: '🎨', title: '4 Art Styles', desc: 'Watercolor, 3D Cartoon, Folk Art, Cinematic' },
              { icon: '👤', title: 'Character Photo Mode', desc: 'Upload a photo to keep the character face consistent across all scenes' },
              { icon: '⚡', title: 'Quick Video Mode', desc: 'Generate a single 10s clip from a prompt — ideal for shorts and reels' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"
              >
                <span className="text-2xl shrink-0">{f.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Simple Pricing</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Quick video = 1 credit · Story video = 10 credits · Start with 3 free credits.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border p-6 ${
                  pkg.popular
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{pkg.label}</h3>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
                  ${(pkg.price / 100).toFixed(2)}
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{pkg.credits} credits</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500" />
                    {pkg.credits} quick videos, or
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500" />
                    {Math.floor(pkg.credits / 10)} full story videos
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Mic className="w-4 h-4 text-violet-500" />
                    Multilingual voiceover
                  </li>
                </ul>
                <Link
                  href="/auth/signup"
                  className={`mt-6 block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    pkg.popular
                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
                      : 'bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-gray-900'
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
            Ready to create your first story video?
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
      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400 dark:text-gray-500">
        © {new Date().getFullYear()} StoryReel
        </div>
      </footer>
    </div>
  )
}
