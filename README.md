# GHL Tutor Agent

An interactive GoHighLevel learning portal for complete beginners who want to become hire-ready for GHL VA, CRM assistant, automation specialist, funnel builder, and marketing automation roles.

## What Is Included

- Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui
- AI tutor chat using Vercel AI SDK and the OpenAI provider
- Local Markdown/JSON curriculum content, no vector database
- Seed lessons for Levels 0-4
- Quiz mode, practice tasks, scenario simulator, portfolio builder, and progress tracker
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

## Content Structure

```text
content/
  modules.json
  lessons/*.md
  quizzes/*.json
  scenarios/*.json
  projects/*.json
```

Each seeded lesson includes a title, skill level, learning objective, plain-English explanation, steps, client example, mistakes, practice task, quiz, expected answer, and hire-ready note.

## Main Routes

- `/` landing page
- `/learn` curriculum dashboard
- `/lesson/[moduleId]` lesson view
- `/agent` interactive tutor chat
- `/practice` practice task generator
- `/quiz` quiz mode
- `/simulator` client scenario simulator
- `/portfolio` portfolio project builder
- `/progress` progress tracker and self-issued completion page
- `/settings` model/API key setup notes

## Deploy To Vercel

1. Push this app to GitHub.
2. Import the project in Vercel.
3. Add `OPENAI_API_KEY`, `OPENAI_MODEL`, `MAX_OUTPUT_TOKENS`, and `ENABLE_HIGHLEVEL_API` in Project Settings.
4. Deploy on the Hobby/free tier.

No paid HighLevel API connection is required for the MVP. The app uses mock data, mock client briefs, and simulated GHL tasks.

## Future Roadmap

- Supabase login, progress sync, quiz scores, and saved portfolio projects
- Optional HighLevel API integration behind `ENABLE_HIGHLEVEL_API=true`
- Admin panel for lessons, quizzes, scenarios, and project rubrics
- Stronger final assessment with rubric-based tutor review
- Certificate generation with student name and completion date
- Paid course features, cohorts, mentor review, and private project feedback
