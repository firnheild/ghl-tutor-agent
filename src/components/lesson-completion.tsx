"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2, ClipboardCheck, LockKeyhole } from "lucide-react";
import type { Module, QuizQuestion, Scenario } from "@/lib/content";
import {
  isModuleUnlocked,
  PASSING_PERCENT,
  practiceProgressKey,
  writeManualProgress,
  writeQuizResults,
} from "@/lib/progress";
import { useManualProgress, useQuizResults } from "@/lib/progress-hooks";

const SERVER_SHUFFLE_SEED = "server";

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleChoices(choices: string[], seed: string) {
  const shuffled = [...choices];
  const random = seededRandom(hashSeed(seed));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function answersMatch(
  currentAnswers: Record<string, string>,
  submittedAnswers?: Record<string, string>,
) {
  if (!submittedAnswers) {
    return false;
  }

  const currentEntries = Object.entries(currentAnswers);

  return (
    currentEntries.length === Object.keys(submittedAnswers).length &&
    currentEntries.every(
      ([questionId, answer]) => submittedAnswers[questionId] === answer,
    )
  );
}

function subscribeToShuffleSeed() {
  return () => {};
}

function getShuffleSeedSnapshot() {
  const browserWindow = window as Window & {
    __ghlLessonQuizShuffleSeed?: string;
  };

  browserWindow.__ghlLessonQuizShuffleSeed ??= `${Date.now()}-${Math.random()}`;
  return browserWindow.__ghlLessonQuizShuffleSeed;
}

function getServerShuffleSeedSnapshot() {
  return SERVER_SHUFFLE_SEED;
}

export function LessonCompletion({
  module,
  modules,
  questions,
  scenario,
}: {
  module: Module;
  modules: Module[];
  questions: QuizQuestion[];
  scenario: Scenario;
}) {
  const manualProgress = useManualProgress();
  const quizResults = useQuizResults();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const shuffleSeed = useSyncExternalStore(
    subscribeToShuffleSeed,
    getShuffleSeedSnapshot,
    getServerShuffleSeedSnapshot,
  );
  const practiceKey = practiceProgressKey(module.id);
  const practiceComplete = Boolean(manualProgress[practiceKey]);
  const moduleUnlocked = isModuleUnlocked(modules, module.id, quizResults);
  const moduleQuestions = questions.filter(
    (question) => question.moduleId === module.id,
  );
  const choicesByQuestion = useMemo(
    () =>
      Object.fromEntries(
        moduleQuestions.map((question) => [
          question.id,
          shuffleSeed === SERVER_SHUFFLE_SEED
            ? question.choices
            : shuffleChoices(question.choices, `${shuffleSeed}-${question.id}`),
        ]),
      ),
    [moduleQuestions, shuffleSeed],
  );
  const score = moduleQuestions.filter(
    (question) => answers[question.id] === question.answer,
  ).length;
  const answeredCount = moduleQuestions.filter(
    (question) => answers[question.id],
  ).length;
  const percent =
    moduleQuestions.length > 0
      ? Math.round((score / moduleQuestions.length) * 100)
      : 0;
  const passed = percent >= PASSING_PERCENT;
  const result = quizResults[module.id];
  const isSubmitted = answersMatch(answers, result?.answers);
  const quizReady =
    moduleUnlocked && practiceComplete && answeredCount === moduleQuestions.length;

  function setPracticeComplete(complete: boolean) {
    writeManualProgress({
      ...manualProgress,
      [practiceKey]: complete,
    });
  }

  function submitQuiz() {
    if (!quizReady) {
      return;
    }

    writeQuizResults({
      ...quizResults,
      [module.id]: {
        moduleId: module.id,
        score,
        total: moduleQuestions.length,
        percent,
        passed,
        completedAt: new Date().toISOString(),
        answers,
      },
    });
  }

  return (
    <section className="space-y-4" id="lesson-completion">
      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200">
            <ClipboardCheck className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Practice before quiz
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Apply Level {module.level}: {module.title}
            </h2>
          </div>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              Client: {scenario.business}
            </p>
            <p className="text-sm leading-6">{scenario.task}</p>
            <div className="rounded-md border bg-muted/40 p-3 text-sm leading-6">
              Submit to yourself: a short implementation plan with tags, fields,
              workflow steps, or testing notes where relevant.
            </div>
          </div>
          <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium">
            <input
              checked={practiceComplete}
              className="size-4 accent-emerald-700"
              onChange={(event) => setPracticeComplete(event.target.checked)}
              type="checkbox"
            />
            Practice done
          </label>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Level {module.level} quiz
            </p>
            <h2 className="mt-1 text-xl font-semibold">{module.title}</h2>
          </div>
          <div className="rounded-md border bg-background px-3 py-2 text-sm">
            {isSubmitted
              ? `Submitted: ${result?.percent}%`
              : `${answeredCount}/${moduleQuestions.length} answered`}
          </div>
        </div>

        {!practiceComplete ? (
          <p className="mt-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <LockKeyhole className="size-4" />
            Finish the practice task first, then submit the quiz.
          </p>
        ) : null}

        <div className="mt-5 space-y-4">
          {moduleQuestions.map((question) => (
            <div key={question.id} className="rounded-lg border bg-background p-4">
              <p className="font-semibold">{question.question}</p>
              <div className="mt-3 grid gap-2">
                {(choicesByQuestion[question.id] ?? question.choices).map(
                  (choice) => {
                    const selected = answers[question.id] === choice;
                    const correct = question.answer === choice;
                    const wrongSubmittedSelection =
                      isSubmitted && selected && !correct;

                    return (
                      <button
                        key={choice}
                        className={`rounded-md border px-3 py-2 text-left text-sm ${
                          isSubmitted && correct
                            ? "border-emerald-600 bg-emerald-100 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-50"
                            : wrongSubmittedSelection
                              ? "border-red-500 bg-red-50 text-red-950 dark:bg-red-950/50 dark:text-red-50"
                              : selected
                                ? "border-emerald-600 bg-emerald-100 text-emerald-950 dark:bg-emerald-900/60 dark:text-emerald-50"
                                : !practiceComplete
                                  ? "cursor-not-allowed bg-muted/60 opacity-60"
                                  : "bg-card"
                        }`}
                        disabled={!practiceComplete}
                        onClick={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: choice,
                          }))
                        }
                        type="button"
                      >
                        {choice}
                      </button>
                    );
                  },
                )}
              </div>
              {isSubmitted ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {answers[question.id] === question.answer
                      ? "Correct."
                      : "Not yet."}
                  </span>{" "}
                  {question.explanation}
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <button
          className="mt-5 w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!quizReady}
          onClick={submitQuiz}
          type="button"
        >
          {!practiceComplete
            ? "Complete practice to unlock quiz submission"
            : answeredCount !== moduleQuestions.length
              ? `Answer ${moduleQuestions.length - answeredCount} more to submit`
              : isSubmitted
                ? `Submitted: ${percent}% ${passed ? "pass" : "not passed"}`
                : "Submit quiz"}
        </button>

        {result?.passed ? (
          <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-4" />
            This level is complete. The next level is unlocked.
          </p>
        ) : null}
      </div>
    </section>
  );
}
