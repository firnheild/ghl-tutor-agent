import Link from "next/link";
import { Bot, Menu, Settings } from "lucide-react";

const navItems = [
  { href: "/learn", label: "Learn" },
  { href: "/glossary", label: "Glossary" },
  { href: "/agent", label: "Agent" },
  { href: "/practice", label: "Practice" },
  { href: "/quiz", label: "Quiz" },
  { href: "/simulator", label: "Simulator" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/progress", label: "Progress" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-9 place-items-center rounded-md bg-emerald-600 text-white">
              <Bot className="size-5" />
            </span>
            <span>GHL Tutor Agent</span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              aria-label="Settings"
              className="grid size-9 place-items-center rounded-md border"
            >
              <Settings className="size-4" />
            </Link>
            <button
              aria-label="Menu"
              className="grid size-9 place-items-center rounded-md border lg:hidden"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
