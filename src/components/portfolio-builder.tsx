"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/content";

type Notes = Record<string, string>;

export function PortfolioBuilder({ projects }: { projects: Project[] }) {
  const [notes, setNotes] = useState<Notes>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const saved = window.localStorage.getItem("ghl-portfolio-notes");
    return saved ? (JSON.parse(saved) as Notes) : {};
  });

  useEffect(() => {
    window.localStorage.setItem("ghl-portfolio-notes", JSON.stringify(notes));
  }, [notes]);

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <div key={project.id} className="rounded-lg border bg-card p-5">
          <h2 className="text-xl font-semibold">{project.title}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {project.deliverables.map((deliverable) => (
              <label
                key={deliverable}
                className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <input type="checkbox" className="size-4 accent-emerald-700" />
                {deliverable}
              </label>
            ))}
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-medium">Case study draft</span>
            <textarea
              value={notes[project.id] ?? ""}
              onChange={(event) =>
                setNotes((current) => ({
                  ...current,
                  [project.id]: event.target.value,
                }))
              }
              className="mt-2 min-h-32 w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
              placeholder={project.caseStudyPrompt}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
