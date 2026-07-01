import Link from "next/link";
import { Building2, ClipboardList } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getScenarios } from "@/lib/content";

export default async function SimulatorPage() {
  const scenarios = await getScenarios();

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Client simulation</p>
        <h1 className="text-3xl font-semibold">Practice real client briefs</h1>
        <p className="max-w-2xl text-muted-foreground">
          These are mock briefs only. Use them to practice requirement mapping
          without needing a paid HighLevel API connection.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-emerald-700" />
              <h2 className="font-semibold">{scenario.business}</h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {scenario.brief}
            </p>
            <div className="mt-4 rounded-md border bg-background p-3 text-sm">
              <div className="mb-2 flex items-center gap-2 font-medium">
                <ClipboardList className="size-4" />
                Your task
              </div>
              {scenario.task}
            </div>
            <Link
              href={`/agent?mode=client-simulation&scenario=${scenario.id}`}
              className="mt-4 inline-flex rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              Simulate with tutor
            </Link>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
