import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const ENHANCE_SYSTEM_PROMPT = `You are a professional video prompt engineer specializing in AI video generation. Your job is to transform simple user ideas into rich, cinematic video generation prompts.

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
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: ENHANCE_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Enhance this video prompt: ${userPrompt}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Anthropic')
  }
  return content.text.trim()
}
