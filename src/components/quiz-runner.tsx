"use client";

import { useMemo, useState } from "react";
import type { QuizQuestion } from "@/lib/content";

export function QuizRunner({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const score = useMemo(
    () =>
      questions.filter((question) => answers[question.id] === question.answer)
        .length,
    [answers, questions],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-5">
        <p className="text-sm text-muted-foreground">Current score</p>
        <p className="mt-1 text-3xl font-semibold">
          {score}/{questions.length}
        </p>
      </div>
      {questions.map((question) => (
        <div key={question.id} className="rounded-lg border bg-card p-5">
          <p className="font-semibold">{question.question}</p>
          <div className="mt-4 grid gap-2">
            {question.choices.map((choice) => {
              const selected = answers[question.id] === choice;
              return (
                <button
                  key={choice}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    selected ? "border-emerald-600 bg-emerald-50" : "bg-background"
                  }`}
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: choice,
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
    </div>
  );
}
