import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { signOut } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function AuthStatus() {
  const configured = isSupabaseConfigured();
  const user = await getCurrentUser();

  if (!configured) {
    return (
      <Link
        href="/login"
        className="hidden items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground hover:bg-muted md:inline-flex"
      >
        <UserRound className="size-4" />
        Local mode
      </Link>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
      >
        <LogIn className="size-4" />
        Sign in
      </Link>
    );
  }

  return (
    <form action={signOut} className="hidden items-center gap-2 md:flex">
      <span className="max-w-40 truncate text-sm text-muted-foreground">
        {user.email}
      </span>
      <button
        className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
        type="submit"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </form>
  );
}
