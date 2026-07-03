"use client";

import { useEffect, useRef } from "react";
import {
  MANUAL_PROGRESS_KEY,
  PROGRESS_CHANGE_EVENT,
  QUIZ_RESULTS_KEY,
} from "@/lib/progress";

const PORTFOLIO_NOTES_KEY = "ghl-portfolio-notes";

function readJsonRecord(key: string) {
  const saved = window.localStorage.getItem(key);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function writeJsonRecord(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value ?? {}));
}

export function ProgressSync() {
  const hydratingRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function hydrateFromServer() {
      const response = await fetch("/api/progress/snapshot", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const snapshot = (await response.json()) as {
        manualProgress?: Record<string, unknown>;
        portfolioNotes?: Record<string, unknown>;
        quizResults?: Record<string, unknown>;
      };

      hydratingRef.current = true;
      writeJsonRecord(MANUAL_PROGRESS_KEY, snapshot.manualProgress);
      writeJsonRecord(QUIZ_RESULTS_KEY, snapshot.quizResults);
      writeJsonRecord(PORTFOLIO_NOTES_KEY, snapshot.portfolioNotes);
      window.dispatchEvent(new Event(PROGRESS_CHANGE_EVENT));
      window.dispatchEvent(new Event("storage"));
      hydratingRef.current = false;
    }

    function syncToServer() {
      if (hydratingRef.current) {
        return;
      }

      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        void fetch("/api/progress/snapshot", {
          body: JSON.stringify({
            manualProgress: readJsonRecord(MANUAL_PROGRESS_KEY),
            portfolioNotes: readJsonRecord(PORTFOLIO_NOTES_KEY),
            quizResults: readJsonRecord(QUIZ_RESULTS_KEY),
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        });
      }, 600);
    }

    void hydrateFromServer();
    window.addEventListener(PROGRESS_CHANGE_EVENT, syncToServer);
    window.addEventListener("beforeunload", syncToServer);

    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, syncToServer);
      window.removeEventListener("beforeunload", syncToServer);
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return null;
}
