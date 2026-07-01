"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  MANUAL_PROGRESS_KEY,
  PROGRESS_CHANGE_EVENT,
  QUIZ_RESULTS_KEY,
  type QuizResults,
} from "@/lib/progress";

const EMPTY_RECORD = "{}";

function subscribeToProgress(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  window.addEventListener(PROGRESS_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
    window.removeEventListener(PROGRESS_CHANGE_EVENT, callback);
  };
}

function getStorageSnapshot(key: string) {
  return window.localStorage.getItem(key) ?? EMPTY_RECORD;
}

function getServerSnapshot() {
  return EMPTY_RECORD;
}

function parseRecord<T>(snapshot: string, fallback: T): T {
  try {
    return JSON.parse(snapshot) as T;
  } catch {
    return fallback;
  }
}

export function useQuizResults() {
  const snapshot = useSyncExternalStore(
    subscribeToProgress,
    () => getStorageSnapshot(QUIZ_RESULTS_KEY),
    getServerSnapshot,
  );

  return useMemo(
    () => parseRecord<QuizResults>(snapshot, {}),
    [snapshot],
  );
}

export function useManualProgress() {
  const snapshot = useSyncExternalStore(
    subscribeToProgress,
    () => getStorageSnapshot(MANUAL_PROGRESS_KEY),
    getServerSnapshot,
  );

  return useMemo(
    () => parseRecord<Record<string, boolean>>(snapshot, {}),
    [snapshot],
  );
}
