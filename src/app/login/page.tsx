import { AppShell } from "@/components/app-shell";
import { signIn, signUp } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function getMessage(searchParams: Record<string, string | string[] | undefined>) {
  const error = searchParams.error;
  const message = searchParams.message;

  if (error === "supabase-not-configured") {
    return {
      tone: "warning",
      text: "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable accounts.",
    };
  }

  if (typeof error === "string") {
    return { tone: "error", text: error };
  }

  if (message === "check-email") {
    return {
      tone: "success",
      text: "Account created. Check your email if confirmation is enabled.",
    };
  }

  return null;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const message = getMessage(resolvedSearchParams);
  const configured = isSupabaseConfigured();

  return (
    <AppShell>
      <section className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm font-medium text-emerald-700">
            Production accounts
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Student sign in</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Sign in to sync lesson progress, practice checklists, quiz attempts,
            screenshot proof metadata, and future AI reviews across devices.
          </p>
          {!configured ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Local demo mode is active because Supabase env vars are missing.
            </p>
          ) : null}
          {message ? (
            <p
              className={`mt-4 rounded-md border p-3 text-sm ${
                message.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : message.tone === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                    : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {message.text}
            </p>
          ) : null}
        </div>

        <div className="grid gap-6">
          <form action={signIn} className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Sign in</h2>
            <label className="mt-4 block text-sm font-medium">
              Email
              <input
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Password
              <input
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                minLength={6}
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="mt-5 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <form action={signUp} className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold">Create student account</h2>
            <label className="mt-4 block text-sm font-medium">
              Full name
              <input
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                name="fullName"
                required
                type="text"
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Email
              <input
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Password
              <input
                className="mt-2 w-full rounded-md border bg-background px-3 py-2"
                minLength={6}
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="mt-5 w-full rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              type="submit"
            >
              Create account
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
