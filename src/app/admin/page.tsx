import Link from "next/link";
import {
  BarChart3,
  ClipboardCheck,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { reviewPortfolioSubmission } from "@/app/admin/actions";
import { AppShell } from "@/components/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function getCount(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  table: string,
) {
  const { count } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  return count ?? 0;
}

async function getPortfolioSubmissions(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
) {
  const { data: submissions } = await supabase
    .from("portfolio_submissions")
    .select(
      "id, user_id, status, project_notes, completed_projects, instructor_feedback, created_at, updated_at",
    )
    .order("updated_at", { ascending: false })
    .limit(20);

  const userIds = Array.from(
    new Set((submissions ?? []).map((submission) => submission.user_id)),
  );

  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds)
      : { data: [] };
  const profilesById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile]),
  );

  return (submissions ?? []).map((submission) => ({
    ...submission,
    profile: profilesById.get(submission.user_id),
  }));
}

export default async function AdminPage() {
  const configured = isSupabaseConfigured();
  const supabase = await createSupabaseServerClient();

  if (!configured || !supabase) {
    return (
      <AppShell>
        <section className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-amber-700">
            Admin setup needed
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Instructor dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Add Supabase env vars and run `supabase/schema.sql` before using the
            production admin dashboard.
          </p>
        </section>
      </AppShell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <AppShell>
        <section className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-emerald-700">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in required</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in with an instructor or admin account to review production
            learner progress.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Sign in
          </Link>
        </section>
      </AppShell>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? "student";

  if (role !== "admin" && role !== "instructor") {
    return (
      <AppShell>
        <section className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-amber-700">
            Student account
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Admin locked</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your account is signed in, but it is not marked as instructor or
            admin. Update `public.profiles.role` in Supabase to unlock this
            dashboard.
          </p>
        </section>
      </AppShell>
    );
  }

  const [
    studentCount,
    snapshotCount,
    quizAttemptCount,
    reviewCount,
    submissionCount,
    portfolioSubmissions,
  ] =
    await Promise.all([
      getCount(supabase, "profiles"),
      getCount(supabase, "student_progress_snapshots"),
      getCount(supabase, "quiz_attempts"),
      getCount(supabase, "ai_reviews"),
      getCount(supabase, "portfolio_submissions"),
      getPortfolioSubmissions(supabase),
    ]);

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">
          Instructor dashboard
        </p>
        <h1 className="text-3xl font-semibold">Production command center</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Review learner activity, quiz volume, and AI review readiness. This is
          the production skeleton for deeper instructor workflows.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <StatCard icon={UsersRound} label="Profiles" value={studentCount} />
        <StatCard icon={BarChart3} label="Synced progress" value={snapshotCount} />
        <StatCard icon={ShieldCheck} label="Quiz attempts" value={quizAttemptCount} />
        <StatCard icon={ShieldCheck} label="AI reviews" value={reviewCount} />
        <StatCard
          icon={ClipboardCheck}
          label="Portfolio reviews"
          value={submissionCount}
        />
      </section>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Portfolio review queue</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Approve final portfolios to unlock certificate readiness, or request
          revision with instructor feedback.
        </p>
        <div className="mt-5 space-y-4">
          {portfolioSubmissions.length === 0 ? (
            <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
              No portfolio submissions yet.
            </p>
          ) : null}
          {portfolioSubmissions.map((submission) => {
            const notes = submission.project_notes as Record<string, string>;
            const completedProjects =
              submission.completed_projects as string[];
            const readyDrafts = Object.values(notes ?? {}).filter(
              (note) => note.trim().length >= 80,
            ).length;

            return (
              <div
                key={submission.id}
                className="rounded-lg border bg-background p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold">
                      {submission.profile?.full_name ??
                        submission.profile?.email ??
                        "Student"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {submission.profile?.email ?? submission.user_id}
                    </p>
                    <p className="mt-2 text-sm">
                      {readyDrafts} review-ready drafts,{" "}
                      {completedProjects?.length ?? 0} projects marked ready
                    </p>
                  </div>
                  <span className="w-fit rounded-md border bg-card px-3 py-2 text-sm capitalize">
                    {submission.status.replace("_", " ")}
                  </span>
                </div>

                <details className="mt-4 rounded-md border bg-card p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Read submitted notes
                  </summary>
                  <div className="mt-3 grid gap-3">
                    {Object.entries(notes ?? {}).map(([projectId, note]) => (
                      <div key={projectId} className="text-sm leading-6">
                        <p className="font-medium">{projectId}</p>
                        <p className="text-muted-foreground">{note}</p>
                      </div>
                    ))}
                  </div>
                </details>

                <form action={reviewPortfolioSubmission} className="mt-4 grid gap-3">
                  <input
                    name="submissionId"
                    type="hidden"
                    value={submission.id}
                  />
                  <label className="block">
                    <span className="text-sm font-medium">
                      Instructor feedback
                    </span>
                    <textarea
                      className="mt-2 min-h-24 w-full rounded-md border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
                      defaultValue={submission.instructor_feedback ?? ""}
                      name="feedback"
                      placeholder="What should the student revise, or why is this approved?"
                    />
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                      name="status"
                      type="submit"
                      value="needs_revision"
                    >
                      Needs revision
                    </button>
                    <button
                      className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                      name="status"
                      type="submit"
                      value="approved"
                    >
                      Approve certificate readiness
                    </button>
                  </div>
                </form>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <Icon className="size-5 text-emerald-700" />
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
