import { AlertTriangle, KeyRound, Server } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Settings</p>
        <h1 className="text-3xl font-semibold">Model and deployment setup</h1>
        <p className="max-w-2xl text-muted-foreground">
          API keys stay server-side in <code>.env.local</code>. The MVP uses
          local content and mock client data, with no paid HighLevel API
          dependency.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <KeyRound className="size-5 text-emerald-700" />
          <h2 className="mt-3 font-semibold">Environment variables</h2>
          <pre className="mt-3 overflow-auto rounded-md bg-muted p-3 text-xs">
{`OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
MAX_OUTPUT_TOKENS=650
ENABLE_HIGHLEVEL_API=false`}
          </pre>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <AlertTriangle className="size-5 text-amber-600" />
          <h2 className="mt-3 font-semibold">Usage warning</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Tutor chat calls the configured model and may cost money. Keep
            answers concise, set <code>MAX_OUTPUT_TOKENS</code>, and do not add
            web search or paid services unless intentionally configured.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <Server className="size-5 text-emerald-700" />
          <h2 className="mt-3 font-semibold">Future integrations</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Supabase, HighLevel API, admin content tools, paid course features,
            and stronger certificates can be added behind explicit environment
            flags.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
