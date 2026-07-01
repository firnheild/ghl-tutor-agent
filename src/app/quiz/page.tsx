import { AppShell } from "@/components/app-shell";
import { QuizRunner } from "@/components/quiz-runner";
import { getQuizzes } from "@/lib/content";

export default async function QuizPage() {
  const questions = await getQuizzes();

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Quiz mode</p>
        <h1 className="text-3xl font-semibold">Check your GHL basics</h1>
        <p className="max-w-2xl text-muted-foreground">
          Short checks keep the learner honest. Each answer gives immediate
          correction in plain language.
        </p>
      </section>
      <QuizRunner questions={questions} />
    </AppShell>
  );
}
