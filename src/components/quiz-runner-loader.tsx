"use client";

import dynamic from "next/dynamic";
import type { QuizRunnerProps } from "@/components/quiz-runner";

const ClientQuizRunner = dynamic(
  () => import("@/components/quiz-runner").then((module) => module.QuizRunner),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading quiz...
      </div>
    ),
  },
);

export function QuizRunnerLoader(props: QuizRunnerProps) {
  return <ClientQuizRunner {...props} />;
}
