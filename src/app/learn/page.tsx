import Link from "next/link";
import { CheckCircle2, CircleDashed, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getModules } from "@/lib/content";

export default async function LearnPage() {
  const modules = await getModules();

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Skill roadmap</p>
        <h1 className="text-3xl font-semibold">Beginner to hire-ready</h1>
        <p className="max-w-3xl text-muted-foreground">
          Work through one level at a time. The MVP now includes seeded lessons
          for the core beginner path, native GHL workflows, and external
          automation basics.
        </p>
      </section>

      <section className="grid gap-4">
        {modules.map((module) => {
          const Icon = module.seeded ? CheckCircle2 : CircleDashed;

          return (
            <Link
              key={module.id}
              href={`/lesson/${module.id}`}
              className="grid gap-4 rounded-lg border bg-card p-5 transition hover:border-emerald-500 md:grid-cols-[auto_1fr_auto] md:items-center"
            >
              <div className="grid size-12 place-items-center rounded-md bg-muted">
                <Icon className="size-5 text-emerald-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Level {module.level}
                </p>
                <h2 className="text-xl font-semibold">{module.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {module.description}
                </p>
                <p className="mt-2 text-sm font-medium">{module.outcome}</p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                {module.seeded ? "Open lesson" : "View roadmap"}
                <PlayCircle className="size-4" />
              </div>
            </Link>
          );
        })}
      </section>
    </AppShell>
  );
}
