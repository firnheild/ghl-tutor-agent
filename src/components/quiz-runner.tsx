"use client";

import { useMemo, useState } from "react";
import type { Module, QuizQuestion } from "@/lib/content";
import {
  isModuleUnlocked,
  PASSING_PERCENT,
  readQuizResults,
  writeQuizResults,
  type QuizResults,
} from "@/lib/progress";

function shuffleChoices(choices: string[]) {
  const shuffled = [...choices];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function QuizRunner({
  modules,
  questions,
}: {
  modules: Module[];
  questions: QuizQuestion[];
}) {
  const [activeModuleId, setActiveModuleId] = useState(modules[0]?.id ?? "");
  const [answersByModule, setAnswersByModule] = useState<
    Record<string, Record<string, string>>
  >({});
  const [results, setResults] = useState<QuizResults>(() => readQuizResults());
  const [choicesByQuestion] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      questions.map((question) => [
        question.id,
        shuffleChoices(question.choices),
      ]),
    ),
  );

  const activeModule = modules.find((module) => module.id === activeModuleId);
  const activeQuestions = questions.filter(
    (question) => question.moduleId === activeModuleId,
  );
  const answers = useMemo(
    () => answersByModule[activeModuleId] ?? {},
    [activeModuleId, answersByModule],
  );

  const score = useMemo(
    () =>
      activeQuestions.filter(
        (question) => answers[question.id] === question.answer,
      ).length,
    [activeQuestions, answers],
  );
  const answeredCount = activeQuestions.filter(
    (question) => answers[question.id],
  ).length;
  const percent =
    activeQuestions.length > 0
      ? Math.round((score / activeQuestions.length) * 100)
      : 0;
  const passed = percent >= PASSING_PERCENT;
  const result = results[activeModuleId];
  const isActiveLocked =
    !isModuleUnlocked(modules, activeModuleId, results);

  function recordResult() {
    if (isActiveLocked) {
      return;
    }

    const nextResults = {
      ...results,
      [activeModuleId]: {
        moduleId: activeModuleId,
        score,
        total: activeQuestions.length,
        percent,
        passed,
        completedAt: new Date().toISOString(),
        answers,
      },
    };

    setResults(nextResults);
    writeQuizResults(nextResults);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        {modules.map((module) => {
          const moduleResult = results[module.id];
          const locked = !isModuleUnlocked(modules, module.id, results);
          return (
            <button
              key={module.id}
              disabled={locked}
              className={`w-full rounded-md border px-3 py-3 text-left text-sm ${
                activeModuleId === module.id
                  ? "border-emerald-600 bg-emerald-50"
                  : locked
                    ? "cursor-not-allowed bg-muted/60 opacity-60"
                  : "bg-card"
              }`}
              onClick={() => setActiveModuleId(module.id)}
            >
              <span className="block font-medium">
                Level {module.level}: {module.title}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {moduleResult
                  ? `${moduleResult.passed ? "Passed" : "Attempted"} - ${moduleResult.percent}%`
                  : locked
                    ? "Locked until previous levels are passed"
                  : "Not taken"}
              </span>
            </button>
          );
        })}
      </aside>

      <section className="space-y-4">
        <div className="rounded-lg border bg-card p-5">
          <p className="text-sm text-muted-foreground">
            {activeModule
              ? `Level ${activeModule.level} quiz`
              : "Choose a skill level"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold">
            {activeModule?.title}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Current score</p>
              <p className="text-2xl font-semibold">
                {score}/{activeQuestions.length}
              </p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Passing score</p>
              <p className="text-2xl font-semibold">{PASSING_PERCENT}%</p>
            </div>
            <div className="rounded-md border bg-background p-3">
              <p className="text-xs text-muted-foreground">Recorded result</p>
              <p className="text-2xl font-semibold">
                {result ? `${result.percent}%` : "--"}
              </p>
            </div>
          </div>
          {result ? (
            <p className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
              {result.passed
                ? "Passed. This level is automatically marked complete in Progress."
                : "Recorded, but not passed yet. Retake this quiz when ready."}
            </p>
          ) : null}
          {isActiveLocked ? (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              This level is locked. Pass all earlier level quizzes before
              taking this quiz.
            </p>
          ) : null}
        </div>

        {activeQuestions.map((question) => (
          <div key={question.id} className="rounded-lg border bg-card p-5">
            <p className="font-semibold">{question.question}</p>
            <div className="mt-4 grid gap-2">
              {(choicesByQuestion[question.id] ?? question.choices).map((choice) => {
                const selected = answers[question.id] === choice;
                return (
                  <button
                    key={choice}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${
                      selected
                        ? "border-emerald-600 bg-emerald-50"
                        : isActiveLocked
                          ? "cursor-not-allowed bg-muted/60 opacity-60"
                        : "bg-background"
                    }`}
                    disabled={isActiveLocked}
                    onClick={() =>
                      setAnswersByModule((current) => ({
                        ...current,
                        [activeModuleId]: {
                          ...(current[activeModuleId] ?? {}),
                          [question.id]: choice,
                        },
                      }))
                    }
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
            {answers[question.id] ? (
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
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

        <button
          disabled={isActiveLocked || answeredCount !== activeQuestions.length}
          onClick={recordResult}
          className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {answeredCount === activeQuestions.length
            ? `Record result: ${percent}% ${passed ? "pass" : "not passed"}`
            : `Answer ${activeQuestions.length - answeredCount} more to record`}
        </button>
      </section>
    </div>
  );
}
