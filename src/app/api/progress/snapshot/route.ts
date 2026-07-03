import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SnapshotSchema = z.object({
  manualProgress: z.record(z.string(), z.boolean()).default({}),
  portfolioNotes: z.record(z.string(), z.string()).default({}),
  quizResults: z.record(z.string(), z.unknown()).default({}),
});

async function getAuthenticatedSupabase() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: "Supabase is not configured.", status: 503 as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to sync progress.", status: 401 as const };
  }

  return { supabase, user };
}

export async function GET() {
  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("student_progress_snapshots")
    .select("manual_progress, quiz_results, portfolio_notes")
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    manualProgress: data?.manual_progress ?? {},
    portfolioNotes: data?.portfolio_notes ?? {},
    quizResults: data?.quiz_results ?? {},
  });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = SnapshotSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid progress snapshot." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("student_progress_snapshots")
    .upsert(
      {
        manual_progress: body.data.manualProgress,
        portfolio_notes: body.data.portfolioNotes,
        quiz_results: body.data.quizResults,
        user_id: auth.user.id,
      },
      { onConflict: "user_id" },
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
