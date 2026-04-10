import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StoryReel — AI Story Videos for YouTube Creators',
  description:
    'Turn any kids story into a YouTube-ready video with multilingual voiceover. Powered by Kling AI and Gemini.',
  openGraph: {
    title: 'StoryReel',
    description: 'Turn any story into an AI-generated video with multilingual voiceover.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
