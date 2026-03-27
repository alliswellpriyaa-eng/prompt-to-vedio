import { GoogleGenerativeAI } from '@google/generative-ai'

const ENHANCE_SYSTEM_PROMPT = `You are a professional video prompt engineer specializing in AI video generation. Your job is to transform simple user ideas into rich, cinematic video generation prompts.

When given a user's basic prompt, rewrite it to be highly descriptive and optimized for AI video generation. Include:
- Specific camera angles and movements (e.g., "slow dolly shot", "aerial drone view", "close-up tracking shot")
- Lighting details (e.g., "golden hour sunlight", "dramatic chiaroscuro", "soft diffused light")
- Motion and atmosphere (e.g., "gentle breeze", "dynamic action", "serene stillness")
- Visual style (e.g., "cinematic 4K", "photorealistic", "filmic grain")
- Color palette and mood
- Specific details about the subject, environment, and any relevant textures or materials

Rules:
- Keep the core subject and intent of the original prompt
- Output ONLY the enhanced prompt — no preamble, no explanation, no quotes
- Keep the enhanced prompt under 300 words
- Make it vivid, specific, and visually compelling`

export async function enhancePrompt(userPrompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: ENHANCE_SYSTEM_PROMPT,
  })

  const result = await model.generateContent(`Enhance this video prompt: ${userPrompt}`)
  const text = result.response.text()

  if (!text) {
    throw new Error('Empty response from Gemini')
  }

  return text.trim()
}
