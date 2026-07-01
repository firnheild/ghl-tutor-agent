"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Briefcase,
  CalendarCheck2,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Compass,
  LockKeyhole,
  type LucideIcon,
  MessageCircle,
  PlayCircle,
  Plug,
  Route,
  Sparkles,
  UsersRound,
  Workflow,
} from "lucide-react";
import type { Module } from "@/lib/content";
import { isModuleUnlocked } from "@/lib/progress";
import { useQuizResults } from "@/lib/progress-hooks";

const levelIcons: LucideIcon[] = [
  Compass,
  UsersRound,
  Route,
  CalendarCheck2,
  ClipboardList,
  MessageCircle,
  Workflow,
  ClipboardCheck,
  Plug,
  Briefcase,
];

const levelStyles = [
  {
    ring: "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-200",
    marker: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-200",
  },
  {
    ring: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200",
    marker: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-200",
  },
  {
    ring: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-200",
    marker: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-200",
  },
  {
    ring: "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200",
    marker: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-200",
  },
  {
    ring: "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-200",
    marker: "bg-cyan-500",
    text: "text-cyan-700 dark:text-cyan-200",
  },
  {
    ring: "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-200",
    marker: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-200",
  },
  {
    ring: "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-200",
    marker: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-200",
  },
  {
    ring: "border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-200",
    marker: "bg-fuchsia-500",
    text: "text-fuchsia-700 dark:text-fuchsia-200",
  },
  {
    ring: "border-lime-500 bg-lime-50 text-lime-700 dark:bg-lime-950/50 dark:text-lime-200",
    marker: "bg-lime-500",
    text: "text-lime-700 dark:text-lime-200",
  },
  {
    ring: "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200",
    marker: "bg-indigo-500",
    text: "text-indigo-700 dark:text-indigo-200",
  },
];

export function RoadmapJourney({ modules }: { modules: Module[] }) {
  const [activeId, setActiveId] = useState(modules[0]?.id ?? "");
  const quizResults = useQuizResults();
  const activeModule =
    modules.find((module) => module.id === activeId) ?? modules[0];
  const activeIndex = Math.max(
    0,
    modules.findIndex((module) => module.id === activeModule?.id),
  );
  const activeStyle = levelStyles[activeIndex % levelStyles.length];
  const ActiveIcon = levelIcons[activeIndex % levelIcons.length] ?? Compass;

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b bg-gradient-to-r from-sky-50 via-rose-50 to-lime-50 px-5 py-5 dark:from-sky-950/30 dark:via-rose-950/30 dark:to-lime-950/30 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-300">
              <Sparkles className="size-4" />
              Skill roadmap
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">
              Beginner to hire-ready
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              A lighter learning path from first GHL words to portfolio-ready
              client work.
            </p>
          </div>
          <Link
            href="/glossary"
            className="inline-flex w-fit items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            <BookOpen className="size-4 text-emerald-700" />
            Beginner glossary
          </Link>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-7 xl:grid-cols-[1fr_340px]">
        <div className="relative min-h-[440px] overflow-hidden rounded-xl border bg-slate-50 p-4 dark:bg-slate-950/40 sm:p-6">
          <svg
            aria-hidden="true"
            className="absolute inset-x-0 top-24 hidden h-72 w-full text-slate-700 opacity-90 dark:text-slate-500 md:block"
            preserveAspectRatio="none"
            viewBox="0 0 1000 260"
          >
            <path
              d="M-20 135 C 95 50 190 220 305 135 S 520 50 635 135 S 825 220 1020 120"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="48"
            />
            <path
              d="M-20 135 C 95 50 190 220 305 135 S 520 50 635 135 S 825 220 1020 120"
              fill="none"
              stroke="white"
              strokeDasharray="16 18"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>

          <div className="grid gap-4 md:grid-cols-5">
            {modules.map((module, index) => {
              const Icon = levelIcons[index % levelIcons.length] ?? Compass;
              const style = levelStyles[index % levelStyles.length];
              const isActive = module.id === activeModule?.id;
              const isTop = index % 2 === 0;
              const unlocked = isModuleUnlocked(modules, module.id, quizResults);
              const passed = Boolean(quizResults[module.id]?.passed);

              return (
                <button
                  key={module.id}
                  aria-pressed={isActive}
                  disabled={!unlocked}
                  className={`group relative z-10 flex min-h-40 flex-col items-center justify-center rounded-lg border bg-background/95 p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md md:min-h-44 ${
                    isTop ? "md:mb-28" : "md:mt-28"
                  } ${
                    isActive
                      ? "border-foreground shadow-md"
                      : unlocked
                        ? "border-border hover:border-foreground/30"
                        : "cursor-not-allowed border-border opacity-45 grayscale hover:translate-y-0 hover:shadow-sm"
                  }`}
                  onClick={() => {
                    if (unlocked) {
                      setActiveId(module.id);
                    }
                  }}
                  type="button"
                >
                  <span
                    className={`grid size-16 place-items-center rounded-full border-4 ${style.ring}`}
                  >
                    {unlocked ? (
                      <Icon className="size-7" />
                    ) : (
                      <LockKeyhole className="size-7" />
                    )}
                  </span>
                  <span className={`mt-3 text-2xl font-semibold ${style.text}`}>
                    {module.level.toString().padStart(2, "0")}
                  </span>
                  <span className="mt-1 text-sm font-semibold leading-5">
                    {module.title}
                  </span>
                  <span className="mt-2 text-xs text-muted-foreground">
                    {passed ? "Done" : unlocked ? "Open" : "Locked"}
                  </span>
                  <span
                    className={`absolute left-1/2 hidden size-4 -translate-x-1/2 rounded-full border-2 border-white ${style.marker} md:block ${
                      isTop ? "bottom-[-3.25rem]" : "top-[-3.25rem]"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {activeModule ? (
          <aside className="rounded-xl border bg-background p-5">
            <div className="flex items-start gap-4">
              <span
                className={`grid size-16 shrink-0 place-items-center rounded-full border-4 ${activeStyle.ring}`}
              >
                <ActiveIcon className="size-7" />
              </span>
              <div>
                <p className={`text-sm font-semibold ${activeStyle.text}`}>
                  Level {activeModule.level}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  {activeModule.title}
                </h2>
              </div>
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              {activeModule.description}
            </p>
            <div className="mt-5 rounded-lg border bg-muted/40 p-4">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Finish line
              </p>
              <p className="mt-2 text-sm font-medium leading-6">
                {activeModule.outcome}
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={`/lesson/${activeModule.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                Open lesson
                <PlayCircle className="size-4" />
              </Link>
              {activeModule.seeded ? (
                <p className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-4" />
                  Lesson content is ready
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Roadmap slot ready for lesson expansion
                </p>
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
