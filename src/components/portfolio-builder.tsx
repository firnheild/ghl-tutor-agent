"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/content";
import { PROGRESS_CHANGE_EVENT } from "@/lib/progress";

type Notes = Record<string, string>;
type SubmissionStatus =
  | "approved"
  | "needs_revision"
  | "not_submitted"
  | "submitted";

const PORTFOLIO_NOTES_KEY = "ghl-portfolio-notes";
const PORTFOLIO_COMPLETED_KEY = "ghl-portfolio-completed";

export function PortfolioBuilder({ projects }: { projects: Project[] }) {
  const [notes, setNotes] = useState<Notes>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const saved = window.localStorage.getItem(PORTFOLIO_NOTES_KEY);
    return saved ? (JSON.parse(saved) as Notes) : {};
  });
  const [completedProjects, setCompletedProjects] = useState<string[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = window.localStorage.getItem(PORTFOLIO_COMPLETED_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  });
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>("not_submitted");
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(PORTFOLIO_NOTES_KEY, JSON.stringify(notes));
    window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
  }, [notes]);

  useEffect(() => {
    window.localStorage.setItem(
      PORTFOLIO_COMPLETED_KEY,
      JSON.stringify(completedProjects),
    );
    window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
  }, [completedProjects]);

  useEffect(() => {
    async function loadSubmission() {
      const response = await fetch("/api/portfolio/submissions", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        completedProjects?: string[];
        instructorFeedback?: string | null;
        projectNotes?: Notes;
        status?: SubmissionStatus;
      };

      setSubmissionStatus(data.status ?? "not_submitted");
      if (data.projectNotes) {
        setNotes(data.projectNotes);
      }
      if (data.completedProjects) {
        setCompletedProjects(data.completedProjects);
      }
      if (data.instructorFeedback) {
        setSubmissionMessage(data.instructorFeedback);
      }
    }

    void loadSubmission();
  }, []);

  const readyDrafts = projects.filter(
    (project) => (notes[project.id] ?? "").trim().length >= 80,
  ).length;
  const readyToSubmit = readyDrafts >= 3;

  function toggleProject(projectId: string, checked: boolean) {
    setCompletedProjects((current) =>
      checked
        ? Array.from(new Set([...current, projectId]))
        : current.filter((id) => id !== projectId),
    );
  }

  async function submitPortfolio() {
    if (!readyToSubmit || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmissionMessage(null);

    const response = await fetch("/api/portfolio/submissions", {
      body: JSON.stringify({
        completedProjects,
        projectNotes: notes,
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });
    const data = (await response.json()) as {
      error?: string;
      status?: SubmissionStatus;
    };

    if (!response.ok) {
      setSubmissionMessage(data.error ?? "Portfolio submission is not ready.");
      setSubmitting(false);
      return;
    }

    setSubmissionStatus(data.status ?? "submitted");
    setSubmissionMessage("Portfolio submitted for instructor review.");
    setSubmitting(false);
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Final review
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Submit portfolio for instructor approval
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Submit at least three case study drafts. Certificate readiness is
              unlocked after an instructor marks the portfolio approved.
            </p>
          </div>
          <span className="rounded-md border bg-background px-3 py-2 text-sm capitalize">
            {submissionStatus.replace("_", " ")}
          </span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border bg-background p-3">
            <p className="text-xs text-muted-foreground">Ready drafts</p>
            <p className="mt-1 text-2xl font-semibold">
              {readyDrafts}/{projects.length}
            </p>
          </div>
          <div className="rounded-md border bg-background p-3">
            <p className="text-xs text-muted-foreground">Marked complete</p>
            <p className="mt-1 text-2xl font-semibold">
              {completedProjects.length}/{projects.length}
            </p>
          </div>
          <button
            className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!readyToSubmit || submitting}
            onClick={submitPortfolio}
            type="button"
          >
            {submitting ? "Submitting" : "Submit for review"}
          </button>
        </div>
        {submissionMessage ? (
          <p className="mt-4 rounded-md border bg-muted/40 p-3 text-sm leading-6">
            {submissionMessage}
          </p>
        ) : null}
      </section>

      {projects.map((project) => (
        <div key={project.id} className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium">
              <input
                checked={completedProjects.includes(project.id)}
                className="size-4 accent-emerald-700"
                onChange={(event) =>
                  toggleProject(project.id, event.target.checked)
                }
                type="checkbox"
              />
              Ready
            </label>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {project.deliverables.map((deliverable) => (
              <div
                key={deliverable}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                {deliverable}
              </div>
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
            <span className="mt-1 block text-xs text-muted-foreground">
              {(notes[project.id] ?? "").trim().length}/80 characters needed
              for review-ready draft.
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}
