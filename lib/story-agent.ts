// /lib/story-agent.ts
// Gemini story scriptwriter with CHARACTER CONSISTENCY built in
// Key upgrade: extracts character description ONCE and locks it
// across ALL scene prompts to prevent character drift

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Scene } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Art style map — matches your supported styles exactly
const ART_STYLE_PROMPTS: Record<string, string> = {
  watercolor:
    'watercolor animation style, warm earthy colors, soft painted look',
  chhota_bheem:
    '3D cartoon style, bright vivid colors, smooth 3D character animation, Pixar quality rendering',
  folk_art:
    'traditional folk art style, flat illustration, bold outlines, vibrant patterns',
  bollywood:
    'cinematic movie style, rich warm tones, dramatic lighting, lush color grading',
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — Extract a locked character description from the story
// This is called ONCE and reused in every scene prompt
// ─────────────────────────────────────────────────────────────
async function extractCharacterDescription(
  storyText: string,
  characterName: string,
  artStyle: string
): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const stylePrompt = ART_STYLE_PROMPTS[artStyle] ?? artStyle

  const result = await model.generateContent(`
You are a character design expert for animated children's videos.

Story text:
"""
${storyText}
"""

Main character name: ${characterName}
Art style: ${stylePrompt}

Write a single, precise visual description of ${characterName} for use
in AI video generation. This description will be copy-pasted at the
START of every scene prompt to ensure the character looks identical
in every clip.

Rules:
- Maximum 30 words
- Describe: species/type, fur/skin color, eye color, key features,
  clothing if any
- End with the art style
- Do NOT include actions, emotions, or scene details
- Return ONLY the description string, nothing else

Example output:
"A young brown bear cub with big amber eyes, white chest patch,
wearing a red cap, 3D cartoon style"
  `)

  return result.response.text().trim().replace(/^"|"$/g, '')
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — Generate all 6 scenes with the locked character desc
// ─────────────────────────────────────────────────────────────
async function generateScenes(
  storyText: string,
  characterName: string,
  characterDesc: string,
  artStyle: string,
  hasPersonImage: boolean
): Promise<Scene[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const stylePrompt = ART_STYLE_PROMPTS[artStyle] ?? artStyle

  const systemInstruction = `
You are a children's story video director for YouTube channels.
Break the story into exactly 6 scenes of 10 seconds each.

CHARACTER CONSISTENCY RULES (most important):
- The main character is: ${characterName}
- Locked character description: "${characterDesc}"
- You MUST start EVERY videoPrompt with this EXACT locked description
- Never paraphrase or change it — copy it word for word every time
- Only after the locked description, add scene-specific details
- This is critical: inconsistent prompts cause the character to look
  different in each clip which destroys the video quality

ART STYLE (use at the end of every videoPrompt):
- Always end every videoPrompt with: ${stylePrompt}
- Never change or omit the art style

PERSON IMAGE RULES:
- hasPersonImage: ${hasPersonImage}
- If hasPersonImage is true → set usePersonImage: true for scenes
  where the character's face or body is clearly visible
- If hasPersonImage is false → set usePersonImage: false for ALL scenes
- Never set usePersonImage: true if hasPersonImage is false

NARRATION RULES:
- Write in simple language a child aged 4-8 can understand
- Each narration fits comfortably in 10 seconds when spoken at 0.9x speed
- Maximum 25 words per narration
- Write in a warm, engaging storytelling tone

VIDEO PROMPT RULES:
- Start with the EXACT locked character description
- Add the scene action (what is happening)
- Add camera movement (slow push-in / wide shot / close-up / pan left etc.)
- End with the art style
- Maximum 80 words total
- No text, watermarks, or logos in the scene

STORY STRUCTURE — 6 scenes:
Scene 1: Setting + introduce main character
Scene 2: The problem or challenge begins
Scene 3: The character tries something / conflict
Scene 4: The turning point or key moment
Scene 5: Resolution
Scene 6: Happy ending + moral lesson

Return ONLY a valid JSON array. No markdown. No explanation. No code blocks.
Start your response directly with [ and end with ]

JSON format:
[
  {
    "sceneNumber": 1,
    "narration": "...",
    "videoPrompt": "...",
    "usePersonImage": true,
    "duration": "10"
  }
]
`

  const result = await model.generateContent([
    { text: systemInstruction },
    { text: `Story:\n"""\n${storyText}\n"""` },
  ])

  const raw = result.response.text().trim()

  // Strip any accidental markdown code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    const scenes = JSON.parse(cleaned) as Scene[]

    // Safety check — ensure every prompt starts with character description
    return scenes.map((scene) => ({
      ...scene,
      videoPrompt: ensureCharacterConsistency(
        scene.videoPrompt,
        characterDesc,
        stylePrompt
      ),
      // Safety: never use person image if none was uploaded
      usePersonImage: hasPersonImage ? scene.usePersonImage : false,
    }))
  } catch {
    throw new Error(
      `Gemini returned invalid JSON. Raw response:\n${raw.slice(0, 300)}`
    )
  }
}

// ─────────────────────────────────────────────────────────────
// Safety function — ensures character desc is always at start
// and art style is always at the end of every videoPrompt
// ─────────────────────────────────────────────────────────────
function ensureCharacterConsistency(
  videoPrompt: string,
  characterDesc: string,
  artStyle: string
): string {
  let prompt = videoPrompt.trim()

  // Prepend character description if not already present
  if (!prompt.toLowerCase().startsWith(characterDesc.toLowerCase().slice(0, 20))) {
    prompt = `${characterDesc}, ${prompt}`
  }

  // Append art style if not already present
  const styleKeyword = artStyle.split(',')[0].toLowerCase()
  if (!prompt.toLowerCase().includes(styleKeyword)) {
    prompt = `${prompt}, ${artStyle}`
  }

  // Trim to 80 words max
  const words = prompt.split(' ')
  if (words.length > 80) {
    prompt = words.slice(0, 80).join(' ')
  }

  return prompt
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT — complete story scene generator
// ─────────────────────────────────────────────────────────────
export async function generateStoryScenes(
  storyText: string,
  characterName: string,
  artStyle: string,
  hasPersonImage: boolean
): Promise<{ scenes: Scene[]; characterDesc: string }> {
  // Step 1 — Extract locked character description once
  const characterDesc = await extractCharacterDescription(
    storyText,
    characterName,
    artStyle
  )

  console.log(`🎨 Character locked: "${characterDesc}"`)

  // Step 2 — Generate all 6 scenes using the locked description
  const scenes = await generateScenes(
    storyText,
    characterName,
    characterDesc,
    artStyle,
    hasPersonImage
  )

  console.log(`✅ ${scenes.length} scenes generated with consistent character`)

  return { scenes, characterDesc }
}