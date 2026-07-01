import { AppShell } from "@/components/app-shell";
import { QuizRunnerLoader } from "@/components/quiz-runner-loader";
import { getModules, getQuizzes } from "@/lib/content";

export default async function QuizPage() {
  const [modules, questions] = await Promise.all([getModules(), getQuizzes()]);

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">Quiz mode</p>
        <h1 className="text-3xl font-semibold">Check your GHL basics</h1>
        <p className="max-w-2xl text-muted-foreground">
          Each skill level has its own recorded quiz. Pass the quiz and the
          progress tracker automatically marks that level complete.
        </p>
      </section>
      <QuizRunnerLoader modules={modules} questions={questions} />
    </AppShell>
  );
}
