import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function enhancePrompt(userPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(`
    You are a cinematic video prompt expert.
    Transform this simple prompt into a rich, detailed video generation prompt.
    Add: camera movement, lighting, style, mood, and visual details.
    Keep it under 200 words. Return only the enhanced prompt, nothing else.
    User prompt: "${userPrompt}"
  `)
  const text = result.response.text()
  if (!text) throw new Error('Empty response from Gemini')
  return text.trim()
}
