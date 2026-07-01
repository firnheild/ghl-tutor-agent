"use client";

import Link from "next/link";
import {
  BookOpen,
  Check,
  Circle,
  ExternalLink,
  LockKeyhole,
} from "lucide-react";
import type { Module } from "@/lib/content";
import {
  isModuleUnlocked,
  readQuizResults,
  type QuizResults,
} from "@/lib/progress";
import { useMemo } from "react";

export function CourseSidebar({
  modules,
  activeModuleId,
}: {
  modules: Module[];
  activeModuleId: string;
}) {
  const results = useMemo<QuizResults>(() => readQuizResults(), []);

  return (
    <aside className="lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium text-muted-foreground">Course</p>
        <h2 className="mt-1 text-lg font-semibold">
          GHL Tutor Agent Training
        </h2>

        <div className="mt-5 space-y-2">
          {modules.map((module) => {
            const active = module.id === activeModuleId;
            const passed = Boolean(results[module.id]?.passed);
            const unlocked = isModuleUnlocked(modules, module.id, results);
            const itemClassName = `grid grid-cols-[24px_1fr] gap-3 rounded-md p-3 text-sm transition ${
              active
                ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50"
                : unlocked
                  ? "hover:bg-muted"
                  : "cursor-not-allowed opacity-50"
            }`;

            const itemContent = (
              <>
                <span
                  className={`mt-0.5 grid size-5 place-items-center rounded-full ${
                    passed
                      ? "bg-emerald-500 text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  {passed ? (
                    <Check className="size-3.5" />
                  ) : unlocked ? (
                    <Circle className="size-4" />
                  ) : (
                    <LockKeyhole className="size-4" />
                  )}
                </span>
                <span>
                  <span className="block text-xs font-medium text-muted-foreground">
                    Level {module.level}
                  </span>
                  <span className="block font-semibold leading-5">
                    {module.title}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {unlocked ? "Lesson - Quiz - Practice" : "Locked"}
                  </span>
                </span>
              </>
            );

            return unlocked ? (
              <Link
                key={module.id}
                href={`/lesson/${module.id}`}
                className={itemClassName}
              >
                {itemContent}
              </Link>
            ) : (
              <div key={module.id} className={itemClassName}>
                {itemContent}
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t pt-4">
          <Link
            href="/glossary"
            className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm hover:bg-muted"
          >
            <span className="inline-flex items-center gap-2">
              <BookOpen className="size-4 text-emerald-700" />
              Glossary
            </span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
