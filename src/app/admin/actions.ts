"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireStaff() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: "Supabase is not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in required." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin" && profile?.role !== "instructor") {
    return { error: "Instructor role required." };
  }

  return { supabase, user };
}

export async function reviewPortfolioSubmission(formData: FormData) {
  const auth = await requireStaff();

  if ("error" in auth) {
    return;
  }

  const submissionId = String(formData.get("submissionId") ?? "");
  const status = String(formData.get("status") ?? "");
  const feedback = String(formData.get("feedback") ?? "").trim();

  if (
    !submissionId ||
    (status !== "approved" && status !== "needs_revision")
  ) {
    return;
  }

  await auth.supabase
    .from("portfolio_submissions")
    .update({
      instructor_feedback: feedback || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.user.id,
      status,
    })
    .eq("id", submissionId);

  revalidatePath("/admin");
}
