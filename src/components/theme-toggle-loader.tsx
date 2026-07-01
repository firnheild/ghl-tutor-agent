"use client";

import dynamic from "next/dynamic";
import { Moon } from "lucide-react";

const ClientThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((module) => module.ThemeToggle),
  {
    ssr: false,
    loading: () => (
      <button
        aria-label="Toggle color theme"
        className="grid size-9 place-items-center rounded-md border"
        type="button"
      >
        <Moon className="size-4" />
      </button>
    ),
  },
);

export function ThemeToggleLoader() {
  return <ClientThemeToggle />;
}
