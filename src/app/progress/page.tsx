import { AppShell } from "@/components/app-shell";
import { ProgressTracker } from "@/components/progress-tracker";
import { getModules, getProjects } from "@/lib/content";

export default async function ProgressPage() {
  const [modules, projects] = await Promise.all([getModules(), getProjects()]);

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Progress tracker</p>
        <h1 className="text-3xl font-semibold">Track learning and projects</h1>
        <p className="max-w-2xl text-muted-foreground">
          Progress is stored locally for solo practice and syncs to Supabase
          when a learner signs in. Quiz completion, practice steps, and
          portfolio notes can follow the student across devices after setup.
        </p>
      </section>
      <ProgressTracker modules={modules} projects={projects} />
    </AppShell>
  );
}
