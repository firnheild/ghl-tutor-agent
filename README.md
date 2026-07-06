# GHL Tutor Agent

An interactive GoHighLevel learning portal for complete beginners who want to become hire-ready for GHL VA, CRM assistant, automation specialist, funnel builder, and marketing automation roles.

## What Is Included

- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui
- AI tutor chat using Vercel AI SDK and the OpenAI provider
- Local Markdown/JSON curriculum content, no vector database
- Seed lessons for Levels 0-9
- Practice tasks, inline lesson quizzes, scenario simulator, portfolio builder, and progress tracker
- Recorded quizzes with at least 10 items per skill level, accessed through lessons and gated by prerequisite level completion
- Optional Supabase accounts, progress sync, quiz attempt storage, and instructor dashboard
- AI practice review from inside each lesson after students complete practice notes
- Zero-knowledge glossary for core GHL and automation terms
- Coursera-style lesson sidebar, gated lesson progression, shuffled quiz choices, and dark/light theme toggle
- Visual snippet slots for GHL screenshots so students can connect terms to the actual app UI
- Mock client briefs and portfolio projects
- Settings page documenting model, token, and cost controls
- Certificate-style self-issued completion page in `/progress`

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Add your server-only OpenAI key to `.env.local`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
MAX_OUTPUT_TOKENS=650
ENABLE_HIGHLEVEL_API=false
```

The app never exposes `OPENAI_API_KEY` to the browser. Tutor chat is the only MVP feature that calls a paid external model.

## Production Accounts And Progress Sync

The app works in local demo mode without Supabase. To enable student accounts,
cross-device progress, saved quiz attempts, and the instructor dashboard:

1. Create a Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Add these variables to `.env.local` and to Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. In Supabase Auth settings, add `http://localhost:3000/auth/callback` and
   your deployed `/auth/callback` URL to allowed redirect URLs.
5. Create your account at `/login`, then promote it in Supabase SQL:

```sql
update public.profiles
set role = 'admin'
where email = 'you@example.com';
```

Students can keep learning locally before signing in. When they sign in,
practice progress, quiz results, and portfolio notes sync through
`/api/progress/snapshot`.

## Content Structure

```text
content/
  modules.json
  lessons/*.md
  practice-reviews.json
  visual-snippets.json
  quizzes/*.json
  scenarios/*.json
  projects/*.json
```

Each seeded lesson includes a title, skill level, learning objective, plain-English explanation, key terms, steps, client example, mistakes, easy practice version, hirable completion standard, quiz prompt, expected answer, and hire-ready note.

`practice-reviews.json` adds the premium assessment layer: rubric criteria, beginner sample answers, hire-ready sample answers, and examples that need improvement.

## Adding Real GHL Screenshots

The app includes redacted training mockups in `public/ghl-snippets/`. Replace these with screenshots from your own demo or training HighLevel account when you are ready.

Keep the same filenames or update `content/visual-snippets.json` with the new image paths.

Recommended screenshot set:

- `orientation-dashboard.svg`: dashboard or launchpad with left navigation visible
- `crm-contacts.svg`: contact list and one contact record showing tags, fields, notes, or tasks
- `pipeline-opportunities.svg`: opportunities pipeline with stage columns
- `calendar-booking.svg`: calendar availability, booking rules, or booking link preview
- `forms-funnels.svg`: form builder, funnel page, or thank-you page
- `conversations-inbox.svg`: conversations inbox with mock or redacted messages
- `workflow-builder.svg`: workflow canvas with trigger, actions, wait, condition, and stop rule
- `client-implementation.svg`: setup checklist, settings, QA, or handoff notes
- `external-automation.svg`: webhook action plus Make, n8n, Zapier, Sheets, or Slack receiving data
- `portfolio-proof.svg`: final proof screenshots, testing notes, or case study visual

Before committing real screenshots, redact names, phone numbers, emails, message content, API keys, webhook URLs, client business data, billing details, and account IDs.

See `GHL_SCREENSHOT_REPLACEMENT_GUIDE.md` before replacing mock visuals.

## Main Routes

- `/` landing page
- `/learn` curriculum dashboard
- `/glossary` beginner-friendly term definitions
- `/lesson/[moduleId]` lesson view
- `/agent` interactive tutor chat
- `/practice` practice task generator
- `/quiz` redirects to `/learn`; quizzes are taken inside lessons
- `/simulator` client scenario simulator
- `/portfolio` portfolio project builder
- `/progress` progress tracker and self-issued completion page
- `/settings` model/API key setup notes
- `/login` student account sign in and sign up
- `/admin` instructor dashboard skeleton for production review

## Deploy To Vercel

1. Push this app to GitHub.
2. Import the project in Vercel.
3. Add `OPENAI_API_KEY`, `OPENAI_MODEL`, `MAX_OUTPUT_TOKENS`, and `ENABLE_HIGHLEVEL_API` in Project Settings.
4. Add Supabase env vars if you want production accounts and progress sync.
5. Deploy on the Hobby/free tier.

No paid HighLevel API connection is required for the MVP. The app uses mock data, mock client briefs, and simulated GHL tasks.

## Future Roadmap

- Optional HighLevel API integration behind `ENABLE_HIGHLEVEL_API=true`
- Full admin content editor for lessons, quizzes, scenarios, and project rubrics
- Stronger final assessment with mentor review queue and certificate approval
- Certificate generation with student name and completion date
- Paid course features, cohorts, mentor review, and private project feedback
