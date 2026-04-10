export async function generateVoiceover(text: string): Promise<Buffer> {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Wavenet-F',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google TTS error (${response.status}): ${err}`)
  }

  const data = await response.json() as { audioContent: string }
  return Buffer.from(data.audioContent, 'base64')
}
