import { Shuffle } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getModules, getScenarios } from "@/lib/content";

export default async function PracticePage() {
  const [modules, scenarios] = await Promise.all([getModules(), getScenarios()]);
  const seeded = modules.filter((module) => module.seeded);

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Daily learning mode</p>
        <h1 className="text-3xl font-semibold">Practice task generator</h1>
        <p className="max-w-2xl text-muted-foreground">
          Pick one small task, answer it, then paste your answer into the tutor
          chat using Check my answer mode.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {seeded.map((module, index) => {
          const scenario = scenarios[index % scenarios.length];
          return (
            <div key={module.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Level {module.level}
                  </p>
                  <h2 className="text-xl font-semibold">{module.title}</h2>
                </div>
                <Shuffle className="size-5 text-emerald-700" />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Client: {scenario.business}
              </p>
              <p className="mt-2 text-sm leading-6">{scenario.task}</p>
              <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
                Submit: a short implementation plan with tags, fields,
                workflow steps, or testing notes where relevant.
              </div>
            </div>
          );
        })}
      </section>
    </AppShell>
  );
}
