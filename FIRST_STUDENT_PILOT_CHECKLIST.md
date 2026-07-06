# First Student Pilot Checklist

Use this checklist when you take the course yourself as the first student.

## Before The Pilot

1. Run the app locally with `npm.cmd run dev`.
2. Confirm `/learn` loads and Level 0 is available.
3. Decide whether this pilot is local-only or Supabase-backed.
4. If Supabase-backed, run `supabase/schema.sql`, add env vars, create your account, and promote your email to admin.
5. Keep a notebook for confusing words, unclear tasks, missing screenshots, and places where you wanted an example.

## Student Pass

For each level from 0 to 9:

1. Read the lesson.
2. Look at the visual example.
3. Do the practice task.
4. Write builder notes and testing notes.
5. Compare your answer with the sample answers.
6. Check your work against the rubric.
7. Request AI review if OpenAI and Supabase are configured.
8. Take the quiz.
9. Record anything that felt confusing or too hard.

## Acceptance Criteria

The course is ready for a small beta when:

- A zero-knowledge student can understand the terms without outside research.
- Every practice task has a clear starting point.
- Every level has a visible example, rubric, and sample answer.
- The student knows what proof to upload or save.
- Quizzes unlock only after practice work.
- The final portfolio project gives the student something they can show honestly.

## Production Setup Pass

1. Create Supabase project.
2. Run `supabase/schema.sql`.
3. Add `NEXT_PUBLIC_SUPABASE_URL`.
4. Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Add `NEXT_PUBLIC_SITE_URL`.
6. Add OpenAI env vars.
7. Deploy to Vercel.
8. Create admin account.
9. Test progress sync on two browsers or devices.
10. Test AI review on one lesson.

## What To Improve After Pilot

Prioritize fixes in this order:

1. Confusing beginner terms.
2. Practice tasks that are too vague.
3. Missing or unclear screenshots.
4. Quiz questions that feel redundant or too obvious.
5. Rubric criteria that do not match the practice task.
6. UI friction that slows down lesson completion.
