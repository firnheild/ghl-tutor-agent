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
          MVP progress is stored locally in the browser. Supabase can be added
          later for accounts, synced progress, quiz scores, and saved projects.
        </p>
      </section>
      <ProgressTracker modules={modules} projects={projects} />
    </AppShell>
  );
}
