import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { TutorChat } from "@/components/tutor-chat";

export default function AgentPage() {
  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">AI tutor</p>
        <h1 className="text-3xl font-semibold">Interactive GHL teacher</h1>
        <p className="max-w-2xl text-muted-foreground">
          Ask short questions, submit answers for correction, simulate client
          tasks, or prepare portfolio and interview responses.
        </p>
      </section>
      <Suspense fallback={<div className="rounded-lg border p-6">Loading tutor...</div>}>
        <TutorChat />
      </Suspense>
    </AppShell>
  );
}
