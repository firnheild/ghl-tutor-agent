"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import type { Module } from "@/lib/content";
import { useQuizResults } from "@/lib/progress-hooks";
import { isModuleUnlocked } from "@/lib/progress";

export function LessonAccessGate({
  modules,
  moduleId,
  children,
}: {
  modules: Module[];
  moduleId: string;
  children: React.ReactNode;
}) {
  const results = useQuizResults();
  const unlocked = isModuleUnlocked(modules, moduleId, results);
  const moduleIndex = modules.findIndex((module) => module.id === moduleId);
  const previousModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;

  if (unlocked) {
    return children;
  }

  return (
    <div className="rounded-lg border bg-card p-8">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted">
          <LockKeyhole className="size-6 text-amber-600" />
        </span>
        <div className="space-y-3">
          <p className="text-sm font-medium text-amber-700">Level locked</p>
          <h1 className="text-2xl font-semibold">
            Complete previous levels first
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            This lesson is locked because the course is designed for a
            zero-knowledge learner. Pass each earlier level quiz before moving
            to the next lesson.
          </p>
          {previousModule ? (
            <p className="rounded-md border bg-muted/40 p-3 text-sm">
              Next step: pass Level {previousModule.level} -{" "}
              {previousModule.title}.
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/quiz"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Go to quiz
            </Link>
            <Link
              href={`/lesson/${modules[0]?.id ?? "orientation"}`}
              className="inline-flex rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Back to first lesson
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
