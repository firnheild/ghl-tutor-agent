export const QUIZ_RESULTS_KEY = "ghl-quiz-results";
export const MANUAL_PROGRESS_KEY = "ghl-progress";
export const PASSING_PERCENT = 66;

export type QuizResult = {
  moduleId: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  completedAt: string;
  answers: Record<string, string>;
};

export type QuizResults = Record<string, QuizResult>;

export function readQuizResults(): QuizResults {
  if (typeof window === "undefined") {
    return {};
  }

  const saved = window.localStorage.getItem(QUIZ_RESULTS_KEY);
  return saved ? (JSON.parse(saved) as QuizResults) : {};
}

export function writeQuizResults(results: QuizResults) {
  window.localStorage.setItem(QUIZ_RESULTS_KEY, JSON.stringify(results));
}

export function readManualProgress(): Record<string, boolean> {
  if (typeof window === "undefined") {
    return {};
  }

  const saved = window.localStorage.getItem(MANUAL_PROGRESS_KEY);
  return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
}

export function writeManualProgress(progress: Record<string, boolean>) {
  window.localStorage.setItem(MANUAL_PROGRESS_KEY, JSON.stringify(progress));
}
