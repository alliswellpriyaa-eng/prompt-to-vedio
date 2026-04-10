import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createServiceClient } from '@/lib/supabase/service'

const execAsync = promisify(exec)

export async function stitchStoryVideo(
  clipUrls: string[],
  audioBuffers: Buffer[],
  videoId: string
): Promise<string> {
  const tmpDir = path.join(os.tmpdir(), `story-${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  try {
    // Download all video clips and write audio files in parallel
    await Promise.all(
      clipUrls.map(async (url, i) => {
        const clipRes = await fetch(url)
        if (!clipRes.ok) throw new Error(`Failed to download clip ${i}: ${clipRes.status}`)
        const buf = Buffer.from(await clipRes.arrayBuffer())
        fs.writeFileSync(path.join(tmpDir, `clip-${i}.mp4`), buf)
        fs.writeFileSync(path.join(tmpDir, `audio-${i}.mp3`), audioBuffers[i])
      })
    )

    // Merge each clip with its voiceover audio
    await Promise.all(
      clipUrls.map(async (_, i) => {
        const clip = path.join(tmpDir, `clip-${i}.mp4`)
        const audio = path.join(tmpDir, `audio-${i}.mp3`)
        const merged = path.join(tmpDir, `merged-${i}.mp4`)
        await execAsync(
          `ffmpeg -i "${clip}" -i "${audio}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -shortest "${merged}" -y`
        )
      })
    )

    // Create concat list file
    const listPath = path.join(tmpDir, 'list.txt')
    const listContent = clipUrls
      .map((_, i) => `file '${path.join(tmpDir, `merged-${i}.mp4`)}'`)
      .join('\n')
    fs.writeFileSync(listPath, listContent)

    // Concatenate all merged clips into final video (re-encode to compress)
    const finalPath = path.join(tmpDir, 'final.mp4')
    await execAsync(
      `ffmpeg -f concat -safe 0 -i "${listPath}" -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 128k -movflags +faststart "${finalPath}" -y`
    )

    // Verify final video exists and has content
    const finalStat = fs.statSync(finalPath)
    console.log(`[stitch] final.mp4 size: ${finalStat.size} bytes`)
    if (finalStat.size === 0) throw new Error('FFmpeg produced an empty final video')

    // Upload final video to Supabase Storage bucket "videos"
    const supabase = createServiceClient()
    const fileBuffer = fs.readFileSync(finalPath)
    const fileName = `${videoId}.mp4`

    console.log(`[stitch] uploading ${fileName} (${fileBuffer.length} bytes) to Supabase Storage`)

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType: 'video/mp4',
        upsert: true,
      })

    if (uploadError) {
      console.error('[stitch] upload error:', JSON.stringify(uploadError))
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    const { data } = supabase.storage.from('videos').getPublicUrl(fileName)
    return data.publicUrl
  } finally {
    // Always clean up temp files
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {
      // ignore cleanup errors
    }
  }
}
