# StoryReel — Claude Code Instructions

## Product name
StoryReel — AI video generator for Indian YouTube creators

## Target user
Indian YouTube channel owners who upload kids moral stories
(Panchatantra, Akbar-Birbal, Tenali Raman, Jataka Tales, original stories)

## Core value proposition
Turn a prompt or full story into a YouTube-ready video with Indian language
voiceover and consistent animation style — in minutes

---

## Tech stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (auth + postgres database + storage)
- fal.ai — Kling v2.6 Pro model for video generation
- Google Gemini API (gemini-2.5-flash) — prompt enhancer + story scriptwriter (free tier)
- Google TTS — voiceover generation (free)
- FFmpeg — video stitching via child_process exec
- Stripe — payments and credit system
- React Compiler enabled (reactCompiler: true in next.config.ts)
- Vercel — hosting and deployment

---

## Project structure
```
/app
  /api
    /generate-video/route.ts         → quick video (prompt → 1 clip)
    /generate-story-video/route.ts   → story video (story → many clips → stitched)
    /checkout/route.ts               → Stripe checkout session
    /webhook/route.ts                → Stripe webhook, adds credits
  /(auth)
    /login/page.tsx
    /signup/page.tsx
  /dashboard
    /page.tsx                        → tab switcher: Quick | Story
    /quick/page.tsx                  → quick video UI
    /story/page.tsx                  → story video UI
    /history/page.tsx                → all past videos
    /credits/page.tsx                → buy credits

/lib
  /supabase.ts                       → Supabase browser client
  /supabase-server.ts                → Supabase server/SSR client
  /fal.ts                            → fal.ai client
  /gemini.ts                         → prompt enhancer agent
  /story-agent.ts                    → story scriptwriter agent (NEW)
  /generate-clips.ts                 → quick video clip generation
  /generate-story-clips.ts           → story clip generation mixed mode (NEW)
  /voiceover.ts                      → Google TTS voiceover (NEW)
  /stitch-video.ts                   → FFmpeg video stitching (NEW)
  /stripe.ts                         → Stripe client

/components
  /PersonImageUpload.tsx             → shared by both modes
  /VideoPlayer.tsx                   → shared by both modes
  /CreditBalance.tsx                 → shown in navbar
  /ArtStylePicker.tsx                → story mode only

/types                               → shared TypeScript types
CLAUDE.md                            → this file
next.config.ts                       → reactCompiler: true
middleware.ts                        → Supabase auth session guard
.env.local                           → all API keys
```

---

## Environment variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
FAL_KEY=
GEMINI_API_KEY=
GOOGLE_TTS_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Database schema (Supabase)

### profiles table
- id uuid (references auth.users)
- email text
- credits integer (default 3 — free on signup)
- created_at timestamp

### videos table
- id uuid (primary key)
- user_id uuid (references profiles.id)
- prompt text (original user prompt or story)
- enhanced_prompt text (Gemini-enhanced prompt, quick mode only)
- video_url text (final video URL in Supabase Storage)
- image_url text (optional person photo URL)
- duration text ("5" or "10")
- status text ("pending" | "processing" | "completed" | "failed")
- video_type text ("quick" | "story")        ← NEW: tells apart the two modes
- language text ("en" | "hi" | "ta" | "te") ← NEW: story mode language
- scenes jsonb (scene array from Gemini, story mode only) ← NEW
- created_at timestamp

### SQL to add new columns to existing videos table
```sql
alter table videos
  add column video_type text default 'quick',
  add column language text default 'en',
  add column scenes jsonb;
```

### Storage buckets
- person-images — uploaded person/character photos (public)
- videos — final stitched story video files (public) ← NEW

### Auto-create profile trigger
```sql
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Feature 1 — Quick video (prompt → single clip)

### Flow
1. User types a short prompt
2. User optionally uploads a person photo
3. Gemini enhances the prompt (cinematic details added)
4. fal.ai Kling generates one 10-second video clip
5. Video saved to Supabase Storage
6. Shown in UI with download button

### API route
POST /api/generate-video

### Endpoints
- With person image: fal-ai/kling-video/v2.6/pro/image-to-video
- Without image:     fal-ai/kling-video/v2.6/pro/text-to-video

### Switching endpoints
```ts
const endpoint = imageUrl
  ? "fal-ai/kling-video/v2.6/pro/image-to-video"
  : "fal-ai/kling-video/v2.6/pro/text-to-video"
```

### Key parameters
```ts
{
  prompt: enhancedPrompt,
  image_url: personImageUrl,   // only for image-to-video
  duration: "10",              // always 10 seconds
  aspect_ratio: "16:9",
  cfg_scale: 0.5,
  negative_prompt: "blur, distort, low quality, deformed face, western style",
}
```

### Cost reference
- 5s video (no audio): ~$0.35
- 10s video (no audio): ~$0.70
- 10s video (with audio): ~$1.40

### Gemini prompt enhancer
```ts
// /lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function enhancePrompt(userPrompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
  const result = await model.generateContent(`
    You are a cinematic video prompt expert.
    Transform this simple prompt into a rich, detailed video generation prompt.
    Add: camera movement, lighting, style, mood, and visual details.
    Keep it under 200 words. Return only the enhanced prompt, nothing else.
    User prompt: "${userPrompt}"
  `)
  return result.response.text()
}
```

---

## Feature 2 — Story video (story → multiple clips → stitched)

### Flow
1. User pastes full story text
2. User enters character name (e.g. "Ravi")
3. User selects language (en/hi/ta/te)
4. User selects art style
5. User optionally uploads character photo
6. Gemini breaks story into 6 scenes (~60s video)
   - Each scene: narration, videoPrompt, usePersonImage, duration
7. Clips generated in parallel batches of 3
   - usePersonImage=true → image-to-video (uses uploaded photo)
   - usePersonImage=false → text-to-video (cheaper, no face needed)
8. Google TTS generates voiceover MP3 for each scene narration
9. FFmpeg merges each clip+audio, then concatenates all into one final video
10. Final video uploaded to Supabase Storage "videos" bucket
11. Shown in UI with download button

### API route
POST /api/generate-story-video

### Scene interface
```ts
interface Scene {
  sceneNumber: number
  narration: string       // text spoken as voiceover (fits 10 seconds)
  videoPrompt: string     // cinematic prompt for Kling (max 80 words)
  usePersonImage: boolean // true = image-to-video, false = text-to-video
  duration: "10"
}
```

### Gemini story agent
```ts
// /lib/story-agent.ts
model: "gemini-2.5-flash"

System instruction:
  Break the story into exactly 6 scenes of 10 seconds each.
  Per scene provide:
    narration: 1-2 sentences narrator will speak (fits in 10 seconds)
    videoPrompt: rich cinematic prompt (under 80 words)
      - Always include art style at the end of every prompt
      - Always include camera movement (slow push-in, pan, aerial, etc.)
      - Keep visual style consistent across all scenes
    usePersonImage: true ONLY if character face matters in this scene
  Return ONLY valid JSON array, no markdown, no explanation.

Output format:
[
  {
    "sceneNumber": 1,
    "narration": "...",
    "videoPrompt": "...",
    "usePersonImage": true,
    "duration": "10"
  }
]
```

### Clip generation — IMPORTANT RULES
```ts
// /lib/generate-story-clips.ts
const BATCH_SIZE = 3  // never exceed 3 parallel for story videos

// Switch endpoint per scene based on usePersonImage flag
const useImage = scene.usePersonImage && personImageUrl
const endpoint = useImage
  ? "fal-ai/kling-video/v2.6/pro/image-to-video"
  : "fal-ai/kling-video/v2.6/pro/text-to-video"

// Always include in negative_prompt for story videos
negative_prompt: "blur, distort, low quality, western style, watermark, text"
```

### Voiceover
```ts
// /lib/voiceover.ts
API: Google TTS
URL: https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}

Language + voice mapping:
  en → languageCode: "en-US", name: "en-US-Journey-F"
  hi → languageCode: "hi-IN", name: "hi-IN-Wavenet-A"
  ta → languageCode: "ta-IN", name: "ta-IN-Wavenet-A"
  te → languageCode: "te-IN", name: "te-IN-Standard-A"

Audio settings:
  audioEncoding: "MP3"
  speakingRate: 0.9   // slightly slower for stories
  pitch: -1.0         // warmer tone

Returns: Buffer (base64 decoded from response.audioContent)
```

### FFmpeg stitching
```ts
// /lib/stitch-video.ts
Steps:
1. Create temp dir: /tmp/story-{timestamp}/
2. Download all video clip URLs → clip-0.mp4, clip-1.mp4 etc.
3. Save all audio buffers → audio-0.mp3, audio-1.mp3 etc.
4. Merge each clip with its voiceover:
   ffmpeg -i clip-N.mp4 -i audio-N.mp3 -c:v copy -c:a aac -shortest merged-N.mp4 -y
5. Create list.txt:
   file '/tmp/story-.../merged-0.mp4'
   file '/tmp/story-.../merged-1.mp4'
6. Concatenate all merged clips:
   ffmpeg -f concat -safe 0 -i list.txt -c copy final.mp4 -y
7. Upload final.mp4 to Supabase Storage bucket "videos"
8. Delete /tmp/story-{timestamp}/ (always cleanup)
9. Return public URL of uploaded video
```

### Supported art styles
- "watercolor  animation style, warm earthy colors"
- "Chhota Bheem 3D cartoon style, bright vivid colors"
- "traditional folk art style, flat illustration"
- "cinematic Bollywood style, rich warm tones"


## Credit system
- New users: 3 free credits on signup (via Supabase trigger)
- Quick video (text only): 1 credit
- Quick video (with person image): 2 credits
- Story video: 10 credits
- Always deduct credits BEFORE calling fal.ai
- Always check credit balance first — block if insufficient
- Show upgrade prompt when credits = 0

### Stripe credit packs
- $5  → 10 credits
- $15 → 35 credits
- $30 → 80 credits

### Checking credits before generation
```ts
const { data: profile } = await supabase
  .from("profiles")
  .select("credits")
  .eq("id", userId)
  .single()

const required = isStoryMode ? 10 : (hasImage ? 2 : 1)

if (!profile || profile.credits < required) {
  return Response.json({ error: "Insufficient credits" }, { status: 402 })
}
```

### Deducting credits
```ts
await supabase
  .from("profiles")
  .update({ credits: profile.credits - required })
  .eq("id", userId)
```

### Saving a video to database
```ts
await supabase.from("videos").insert({
  user_id: userId,
  prompt: originalPrompt,
  video_url: finalVideoUrl,
  image_url: personImageUrl ?? null,
  video_type: "story",      // or "quick"
  language: "hi",           // null for quick videos
  scenes: scenesArray,      // null for quick videos
  status: "completed",
})
```

---

## Dashboard UI — tab switcher
```tsx
// /app/dashboard/page.tsx
const [mode, setMode] = useState<"quick" | "story">("quick")
// Two tabs: "Quick video (1 credit)" and "Story video (10 credits)"
// Renders <QuickVideoPage /> or <StoryVideoPage /> based on active tab
```

---

## Person image upload (shared by both modes)
- Component: /components/PersonImageUpload.tsx
- Upload to Supabase Storage bucket: "person-images"
- Returns public URL → passed as image_url to fal.ai
- Accepted formats: JPG, PNG, WEBP
- Show preview thumbnail after upload
- Show tip: "Best results: clear, well-lit photo, person takes up most of the frame"
- RLS policy: authenticated users can upload, public can view

---

## Key files to reference for patterns
- /lib/supabase.ts         — use this for all Supabase browser calls
- /lib/supabase-server.ts  — use this for all server-side Supabase calls
- /lib/fal.ts              — use this for all fal.ai calls
- /lib/gemini.ts           — use this for prompt enhancement pattern
- /lib/story-agent.ts      — use this for story scene generation pattern
- /lib/voiceover.ts        — use this for Google TTS pattern
- /lib/stitch-video.ts     — use this for FFmpeg stitching pattern

---

## Coding rules
- Always use functional React components with hooks
- NEVER manually write useMemo, useCallback, or React.memo
  (React Compiler handles memoization automatically)
- Use server components by default
- Add "use client" only when strictly necessary (forms, state, events, browser APIs)
- Tailwind utilities only — no custom CSS files
- All API keys from environment variables only — NEVER hardcode
- Always handle loading, error, and empty states in UI
- Always wrap fal.ai, Gemini, TTS, and FFmpeg calls in try/catch
- Always return meaningful error messages to the frontend
- TypeScript strict mode — no `any` types
- Prefer async/await over .then() chains

---

## Security rules
- Never expose FAL_KEY, GEMINI_API_KEY, GOOGLE_TTS_KEY, STRIPE_SECRET_KEY to client
- All video generation goes through /app/api routes (server-side only)
- Always verify user session server-side before deducting credits
- Supabase RLS — users see only their own data
- Validate and sanitize all user inputs before passing to any API
- FFmpeg runs in /tmp only — never in the project directory
- Always clean up /tmp files after stitching is complete

---

## Commands
- npm run dev           — start development server
- npm run build         — production build
- npm run lint          — run ESLint (always run after making changes)
- npx supabase db push  — push schema changes to Supabase

---

## Claude Code daily workflow
```
1. Open project → /clear (fresh context)
2. Shift+Tab → Plan Mode
3. "Plan today's task: [describe it]. Don't write code yet."
4. Review plan → correct if needed
5. Shift+Tab → Normal Mode
6. "Implement the plan. Run npm run lint after."
7. Review the diff → approve changes
8. "Commit with a descriptive message"
9. Repeat
```

## Claude Code 5 key habits
1. Always use Plan Mode first for anything touching more than 2 files
2. Always give Claude a lint/test command to self-verify after writing code
3. Use /clear every time you start a new feature — don't carry old context
4. Reference specific file paths in every prompt, not vague descriptions
5. Put permanent rules in CLAUDE.md — use hooks for things that must always run

## API key rule (always)
Never hardcode API keys. Always use process.env.
Always handle API errors gracefully with try/catch.
Always return meaningful error messages to the frontend.

---

## After every change
- Run npm run lint and fix all errors before considering a task done
- Test both quick video and story video flows end to end
- Verify credits are deducted correctly for both modes
- Check that all videos appear correctly in /dashboard/history
