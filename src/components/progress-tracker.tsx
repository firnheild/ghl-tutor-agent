"use client";

import { useMemo } from "react";
import type { Module, Project } from "@/lib/content";
import { useManualProgress, useQuizResults } from "@/lib/progress-hooks";
import { writeManualProgress } from "@/lib/progress";

export function ProgressTracker({
  modules,
  projects,
}: {
  modules: Module[];
  projects: Project[];
}) {
  const manualProgress = useManualProgress();
  const quizResults = useQuizResults();

  const totalItems = modules.length + projects.length;
  const completedCount = useMemo(() => {
    const completedModules = modules.filter(
      (module) => quizResults[module.id]?.passed,
    ).length;
    const completedProjects = projects.filter(
      (project) => manualProgress[`project-${project.id}`],
    ).length;

    return completedModules + completedProjects;
  }, [manualProgress, modules, projects, quizResults]);
  const percent = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        {modules.map((module) => {
          const result = quizResults[module.id];
          const passed = Boolean(result?.passed);

          return (
            <div
              key={module.id}
              className="flex items-start gap-3 rounded-lg border bg-card p-4"
            >
              <span
                className={`mt-1 grid size-5 place-items-center rounded-full border text-xs ${
                  passed
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-muted-foreground text-muted-foreground"
                }`}
              >
                {passed ? "✓" : ""}
              </span>
              <span>
                <span className="block font-semibold">{module.title}</span>
                <span className="text-sm text-muted-foreground">
                  {passed
                    ? `Completed by quiz: ${result?.percent}%`
                    : "Not complete yet. Pass this level's quiz to unlock completion."}
                </span>
              </span>
            </div>
          );
        })}

        {projects.map((project) => (
          <label
            key={project.id}
            className="flex items-start gap-3 rounded-lg border bg-card p-4"
          >
            <input
              type="checkbox"
              className="mt-1 size-4 accent-emerald-700"
              checked={Boolean(manualProgress[`project-${project.id}`])}
              onChange={(event) =>
                writeManualProgress({
                  ...manualProgress,
                  [`project-${project.id}`]: event.target.checked,
                })
              }
            />
            <span>
              <span className="block font-semibold">{project.title}</span>
              <span className="text-sm text-muted-foreground">
                Portfolio project. Mark manually after your case study draft is
                done.
              </span>
            </span>
          </label>
        ))}
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">Completion progress</p>
          <p className="mt-2 text-4xl font-semibold">{percent}%</p>
          <div className="mt-4 h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-emerald-600"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Self-issued completion
          </p>
          <h2 className="mt-4 text-2xl font-semibold">
            GHL Tutor Agent Training Completion
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            This certificate-style page is for self-issued training completion
            only. It is not official HighLevel certification.
          </p>
        </div>
      </aside>
    </div>
  );
}
