import Link from "next/link";
import { BarChart3, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";
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

  const [studentCount, snapshotCount, quizAttemptCount, reviewCount] =
    await Promise.all([
      getCount(supabase, "profiles"),
      getCount(supabase, "student_progress_snapshots"),
      getCount(supabase, "quiz_attempts"),
      getCount(supabase, "ai_reviews"),
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

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard icon={UsersRound} label="Profiles" value={studentCount} />
        <StatCard icon={BarChart3} label="Synced progress" value={snapshotCount} />
        <StatCard icon={ShieldCheck} label="Quiz attempts" value={quizAttemptCount} />
        <StatCard icon={ShieldCheck} label="AI reviews" value={reviewCount} />
      </section>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold">Next admin build-outs</h2>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>Review submitted practice proof and notes per module.</p>
          <p>Edit lesson content, quizzes, and visual examples.</p>
          <p>Approve final certificates and portfolio readiness.</p>
          <p>Export learner progress for cohort reporting.</p>
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
