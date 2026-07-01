"use client";

import { useEffect, useMemo, useState } from "react";
import type { Module, Project } from "@/lib/content";

export function ProgressTracker({
  modules,
  projects,
}: {
  modules: Module[];
  projects: Project[];
}) {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const saved = window.localStorage.getItem("ghl-progress");
    return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
  });

  useEffect(() => {
    window.localStorage.setItem("ghl-progress", JSON.stringify(completed));
  }, [completed]);

  const totalItems = modules.length + projects.length;
  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed],
  );
  const percent = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-4">
        {[...modules, ...projects.map((project, index) => ({
          id: `project-${project.id}`,
          title: project.title,
          level: index + 10,
          description: "Portfolio project",
          outcome: project.caseStudyPrompt,
          lesson: "",
          seeded: true,
        }))].map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 rounded-lg border bg-card p-4"
          >
            <input
              type="checkbox"
              className="mt-1 size-4 accent-emerald-700"
              checked={Boolean(completed[item.id])}
              onChange={(event) =>
                setCompleted((current) => ({
                  ...current,
                  [item.id]: event.target.checked,
                }))
              }
            />
            <span>
              <span className="block font-semibold">{item.title}</span>
              <span className="text-sm text-muted-foreground">
                {item.outcome}
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
