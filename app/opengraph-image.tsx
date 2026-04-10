import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'StoryReel — AI Story Videos for YouTube Creators'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #1d4ed8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* Logo + name */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
            }}
          >
            🎬
          </div>
          <div
            style={{
              fontSize: '68px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            StoryReel
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '30px',
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            maxWidth: '860px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Turn any story into an AI-generated video with multilingual voiceover
        </div>

   

        {/* Powered by */}
        <div
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          Kling AI · Gemini · Google TTS
        </div>
      </div>
    ),
    { ...size }
  )
}
