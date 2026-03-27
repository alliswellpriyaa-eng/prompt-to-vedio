## Project overview
AI video generation SaaS. Users type a prompt, an AI agent 
enhances it, then calls fal.ai to generate a video. 
Users buy credits via Stripe to generate videos.

## Tech stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (auth + postgres database)
- fal.ai (Kling model for video generation)
- Anthropic Claude API (prompt enhancement agent)
- Stripe (payments)
- React Compiler enabled (reactCompiler: true in next.config.ts)

## Architecture
- /app — Next.js App Router pages
- /app/api — API routes (generate-video, checkout, webhook)
- /components — reusable React components
- /lib — supabase client, fal client, stripe client, utils
- /types — TypeScript types

## Coding rules
- Always use functional React components with hooks
- Never use useMemo, useCallback, or React.memo manually
  (React Compiler handles this automatically)
- Use server components by default, client components only
  when needed (forms, state, browser APIs)
- Use Tailwind utilities only, no custom CSS files
- All API keys must come from environment variables only
- Always handle loading and error states in UI components

## Commands
- npm run dev — start dev server
- npm run build — production build
- npm run lint — run ESLint
- npx supabase db push — push db schema changes
```

---

## The 5 Habits That Will 10x Your Claude Code Output

**1. Always use Plan Mode first for anything complex**

Use Plan Mode to separate exploration from execution — Claude reads files and answers questions without making changes. This is most useful when you're uncertain about the approach, when the change modifies multiple files, or when you're unfamiliar with the code being modified. 

Press `Shift+Tab` to enter Plan Mode. For example:
> *"Plan how to build the Stripe webhook that adds credits to the user after payment. Don't write any code yet."*

Review the plan, correct anything, then say "go ahead."

**2. Always give Claude a way to verify its own work**

Give Claude a feedback loop so it catches its own mistakes. Include test commands, linter checks, or expected outputs in your prompt — Claude runs the tests, sees failures, and fixes them without you stepping in. This alone gives a 2–3x quality improvement. 

Example prompt:
> *"Build the /api/generate-video route. After writing it, run `npm run lint` and fix any errors."*

**3. Use `/clear` constantly**

Use `/clear` often. Every time you start something new, clear the chat. You don't need all that history eating your tokens, and you definitely don't need Claude running compaction calls to summarize old conversations. 

Each day or each new feature = fresh `/clear` + fresh task.

**4. Reference specific files in every prompt**

The more precise your instructions, the fewer corrections you'll need. Reference specific files, mention constraints, and point to example patterns. 

Instead of: *"Add auth"*
Say: *"Add Google OAuth to `/app/login/page.tsx` using Supabase auth. Follow the same pattern as `/lib/supabase.ts`."*

**5. Use `CLAUDE.md` for rules, hooks for enforcement**

`CLAUDE.md` is advisory — Claude follows it about 80% of the time. Hooks are deterministic, 100%. If something must happen every time without exception (formatting, linting, security checks), make it a hook. 

---

## Your Daily Workflow with Claude Code
```
1. Open project → /clear (fresh context)
2. Shift+Tab → Plan Mode
3. "Plan today's task: [describe it]"
4. Review plan → correct if needed
5. Shift+Tab → Normal Mode
6. "Implement the plan. Run npm run lint after."
7. Review the diff → approve changes
8. "Commit with a descriptive message"
9. Repeat
 ## API Key rules
We are building an AI video SaaS. Never hardcode API keys. Always use process.env. Always handle API errors gracefully with try/catch and return meaningful error messages to the frontend