import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const SubmissionSchema = z.object({
  completedProjects: z.array(z.string()).default([]),
  projectNotes: z.record(z.string(), z.string()).default({}),
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
    return { error: "Sign in to submit your portfolio.", status: 401 as const };
  }

  return { supabase, user };
}

export async function GET() {
  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data, error } = await auth.supabase
    .from("portfolio_submissions")
    .select(
      "id, project_notes, completed_projects, status, instructor_feedback, reviewed_at, created_at, updated_at",
    )
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    completedProjects: data?.completed_projects ?? [],
    createdAt: data?.created_at ?? null,
    id: data?.id ?? null,
    instructorFeedback: data?.instructor_feedback ?? null,
    projectNotes: data?.project_notes ?? {},
    reviewedAt: data?.reviewed_at ?? null,
    status: data?.status ?? "not_submitted",
    updatedAt: data?.updated_at ?? null,
  });
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = SubmissionSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid portfolio submission." },
      { status: 400 },
    );
  }

  const nonEmptyNotes = Object.values(body.data.projectNotes).filter(
    (note) => note.trim().length >= 80,
  );

  if (nonEmptyNotes.length < 3) {
    return NextResponse.json(
      {
        error:
          "Submit at least three portfolio case study drafts with 80+ characters each.",
      },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("portfolio_submissions")
    .upsert(
      {
        completed_projects: body.data.completedProjects,
        instructor_feedback: null,
        project_notes: body.data.projectNotes,
        reviewed_at: null,
        reviewed_by: null,
        status: "submitted",
        user_id: auth.user.id,
      },
      { onConflict: "user_id" },
    )
    .select("id, status, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    status: data.status,
    updatedAt: data.updated_at,
  });
}
