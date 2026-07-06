"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Award,
  BookOpenCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileImage,
  ListChecks,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  Module,
  PracticeGuide,
  PracticeReview,
  PracticeReviewSample,
  QuizQuestion,
  Scenario,
} from "@/lib/content";
import {
  isModuleUnlocked,
  PASSING_PERCENT,
  practiceProgressKey,
  practiceStepProgressKey,
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

const sampleLabels: Record<
  keyof PracticeReview["samples"],
  { label: string; tone: string }
> = {
  beginner: {
    label: "Beginner answer",
    tone: "Acceptable first pass",
  },
  hireReady: {
    label: "Hire-ready answer",
    tone: "Stronger client-ready version",
  },
  needsImprovement: {
    label: "Needs improvement",
    tone: "What to avoid",
  },
};

function SampleAnswerCard({
  sample,
  tone,
  title,
}: {
  sample: PracticeReviewSample;
  tone: string;
  title: string;
}) {
  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{tone}</p>
      <div className="mt-3 space-y-3 text-sm leading-6">
        <div>
          <p className="font-medium">Builder notes</p>
          <p className="text-muted-foreground">{sample.builderNotes}</p>
        </div>
        <div>
          <p className="font-medium">Testing notes</p>
          <p className="text-muted-foreground">{sample.testingNotes}</p>
        </div>
        <div className="rounded-md border bg-muted/40 p-2">
          <p className="font-medium">Instructor note</p>
          <p className="text-muted-foreground">{sample.whyItWorks}</p>
        </div>
      </div>
    </div>
  );
}

export function LessonCompletion({
  module,
  modules,
  practiceGuide,
  practiceReview,
  questions,
  scenario,
}: {
  module: Module;
  modules: Module[];
  practiceGuide?: PracticeGuide;
  practiceReview?: PracticeReview;
  questions: QuizQuestion[];
  scenario: Scenario;
}) {
  const manualProgress = useManualProgress();
  const quizResults = useQuizResults();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [builderNotes, setBuilderNotes] = useState("");
  const [testingNotes, setTestingNotes] = useState("");
  const [proofImageUrl, setProofImageUrl] = useState<string | null>(null);
  const [proofImageName, setProofImageName] = useState<string | null>(null);
  const [review, setReview] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const shuffleSeed = useSyncExternalStore(
    subscribeToShuffleSeed,
    getShuffleSeedSnapshot,
    getServerShuffleSeedSnapshot,
  );
  const practiceKey = practiceProgressKey(module.id);
  const guideSteps = practiceGuide?.steps ?? [
    "Read the lesson example.",
    "Write a short implementation plan.",
    "Add testing notes before taking the quiz.",
  ];
  const completedStepCount = guideSteps.filter((_, index) =>
    Boolean(manualProgress[practiceStepProgressKey(module.id, index)]),
  ).length;
  const allPracticeStepsComplete = completedStepCount === guideSteps.length;
  const practiceComplete =
    Boolean(manualProgress[practiceKey]) && allPracticeStepsComplete;
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
  const reviewReady =
    practiceComplete &&
    builderNotes.trim().length >= 20 &&
    testingNotes.trim().length >= 20;
  const samplesUnlocked =
    builderNotes.trim().length >= 20 || testingNotes.trim().length >= 20;

  useEffect(() => {
    return () => {
      if (proofImageUrl) {
        URL.revokeObjectURL(proofImageUrl);
      }
    };
  }, [proofImageUrl]);

  function setPracticeStepComplete(stepIndex: number, complete: boolean) {
    const nextProgress = {
      ...manualProgress,
      [practiceStepProgressKey(module.id, stepIndex)]: complete,
    };
    const nextCompletedCount = guideSteps.filter((_, index) =>
      index === stepIndex
        ? complete
        : Boolean(nextProgress[practiceStepProgressKey(module.id, index)]),
    ).length;

    writeManualProgress({
      ...nextProgress,
      [practiceKey]: nextCompletedCount === guideSteps.length,
    });
  }

  function markPracticeComplete() {
    writeManualProgress({
      ...manualProgress,
      ...Object.fromEntries(
        guideSteps.map((_, index) => [
          practiceStepProgressKey(module.id, index),
          true,
        ]),
      ),
      [practiceKey]: true,
    });
  }

  function selectProofImage(file?: File) {
    if (!file) {
      return;
    }

    if (proofImageUrl) {
      URL.revokeObjectURL(proofImageUrl);
    }

    setProofImageName(file.name);
    setProofImageUrl(URL.createObjectURL(file));
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

  async function requestAiReview() {
    if (!reviewReady || reviewLoading) {
      return;
    }

    setReviewLoading(true);
    setReviewError(null);
    setReview(null);

    try {
      const response = await fetch("/api/ai-review", {
        body: JSON.stringify({
          builderNotes,
          moduleId: module.id,
          practiceSteps: guideSteps.filter((_, index) =>
            Boolean(manualProgress[practiceStepProgressKey(module.id, index)]),
          ),
          screenshotProvided: Boolean(proofImageName),
          testingNotes,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as {
        error?: string;
        review?: string;
      };

      if (!response.ok) {
        setReviewError(data.error ?? "AI review is not available yet.");
        return;
      }

      setReview(data.review ?? null);
    } catch {
      setReviewError("AI review could not be reached. Try again after setup.");
    } finally {
      setReviewLoading(false);
    }
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
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              Client: {scenario.business}
            </p>
            <p className="text-sm leading-6">{scenario.task}</p>
            {practiceGuide ? (
              <div className="rounded-md border bg-muted/40 p-3 text-sm leading-6">
                <span className="font-medium">Example:</span>{" "}
                {practiceGuide.example}
              </div>
            ) : null}
          </div>
          {practiceGuide ? (
            <div className="rounded-lg border bg-background p-3">
              <div className="overflow-hidden rounded-md border bg-muted">
                <Image
                  src={practiceGuide.image}
                  alt={`${practiceGuide.title} practice example`}
                  width={1200}
                  height={720}
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium">
                <Camera className="size-4 text-emerald-700" />
                Example visual for this practice
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border bg-background p-4">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <ListChecks className="size-4 text-emerald-700" />
              Do the practice
            </p>
            <div className="space-y-2">
              {guideSteps.map((step, index) => {
                const stepKey = practiceStepProgressKey(module.id, index);

                return (
                  <label
                    key={step}
                    className="flex items-start gap-3 rounded-md border bg-card p-3 text-sm leading-6"
                  >
                    <input
                      checked={Boolean(manualProgress[stepKey])}
                      className="mt-1 size-4 accent-emerald-700"
                      onChange={(event) =>
                        setPracticeStepComplete(index, event.target.checked)
                      }
                      type="checkbox"
                    />
                    <span>{step}</span>
                  </label>
                );
              })}
            </div>
            <button
              className="mt-3 w-full rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
              onClick={markPracticeComplete}
              type="button"
            >
              Mark all practice steps done
            </button>
          </div>

          <div className="rounded-lg border bg-background p-4">
            <p className="mb-3 flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-emerald-700" />
              Expected output
            </p>
            <div className="flex flex-wrap gap-2">
              {(practiceGuide?.expectedOutput ?? [
                "Implementation plan",
                "Testing notes",
                "Screenshot proof",
              ]).map((item) => (
                <span
                  key={item}
                  className="rounded-md border bg-card px-2 py-1 text-xs text-muted-foreground"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm leading-6">
              {practiceGuide?.testingNotes ??
                "Test your plan with fake data before using real client data."}
            </div>
            <label className="mt-4 flex cursor-pointer items-center justify-between gap-3 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted">
              <span className="inline-flex items-center gap-2">
                <FileImage className="size-4 text-emerald-700" />
                Add screenshot proof
              </span>
              <input
                accept="image/*"
                className="sr-only"
                onChange={(event) => selectProofImage(event.target.files?.[0])}
                type="file"
              />
            </label>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {practiceGuide?.screenshotPrompt ??
                "Use a redacted screenshot or practice mockup."}
            </p>
            {proofImageUrl ? (
              <div className="mt-3 overflow-hidden rounded-md border">
                {/* Local object URLs cannot be optimized by next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={proofImageName ?? "Practice proof"}
                  className="h-auto w-full"
                  src={proofImageUrl}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block rounded-lg border bg-background p-4">
            <span className="text-sm font-medium">Builder notes</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
              onChange={(event) => setBuilderNotes(event.target.value)}
              placeholder="Write the tags, fields, workflow steps, or setup choices you would build..."
              value={builderNotes}
            />
          </label>
          <label className="block rounded-lg border bg-background p-4">
            <span className="text-sm font-medium">Testing notes</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border bg-card p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600"
              onChange={(event) => setTestingNotes(event.target.value)}
              placeholder="Write how you would test this with fake data before a client launch..."
              value={testingNotes}
            />
          </label>
        </div>

        {practiceReview ? (
          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-lg border bg-background p-4">
              <p className="mb-3 flex items-center gap-2 font-semibold">
                <Award className="size-4 text-emerald-700" />
                Practice rubric
              </p>
              <div className="space-y-3">
                {practiceReview.rubric.map((item) => (
                  <div key={item.criterion} className="rounded-md border bg-card p-3">
                    <p className="text-sm font-semibold">{item.criterion}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      <span className="font-medium text-foreground">Pass:</span>{" "}
                      {item.pass}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      <span className="font-medium text-foreground">
                        Strong:
                      </span>{" "}
                      {item.excellent}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    <BookOpenCheck className="size-4 text-emerald-700" />
                    Sample answers
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Write your own notes first, then compare against these
                    examples.
                  </p>
                </div>
                <button
                  className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!samplesUnlocked}
                  onClick={() => setShowSamples((current) => !current)}
                  type="button"
                >
                  {showSamples ? "Hide samples" : "View samples"}
                </button>
              </div>
              {!samplesUnlocked ? (
                <p className="mt-3 rounded-md border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                  Add at least 20 characters to builder notes or testing notes
                  before viewing the examples.
                </p>
              ) : null}
              {showSamples ? (
                <div className="mt-4 space-y-3">
                  {(
                    Object.entries(practiceReview.samples) as [
                      keyof PracticeReview["samples"],
                      PracticeReviewSample,
                    ][]
                  ).map(([key, sample]) => (
                    <SampleAnswerCard
                      key={key}
                      sample={sample}
                      title={sampleLabels[key].label}
                      tone={sampleLabels[key].tone}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {completedStepCount}/{guideSteps.length} practice steps complete
          </p>
          <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium">
            <input
              checked={practiceComplete}
              className="size-4 accent-emerald-700"
              onChange={(event) => {
                if (event.target.checked) {
                  markPracticeComplete();
                }
              }}
              type="checkbox"
            />
            Practice done
          </label>
        </div>

        <div className="mt-5 rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="size-4 text-emerald-700" />
                AI practice review
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Request feedback after writing builder notes and testing notes.
                Reviews are saved to your account when Supabase is connected.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!reviewReady || reviewLoading}
              onClick={requestAiReview}
              type="button"
            >
              {reviewLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {reviewLoading ? "Reviewing" : "Request review"}
            </button>
          </div>
          {!reviewReady ? (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Complete practice and add at least 20 characters in both notes to
              unlock AI review.
            </p>
          ) : null}
          {reviewError ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100">
              {reviewError}
            </p>
          ) : null}
          {review ? (
            <div className="mt-3 whitespace-pre-wrap rounded-md border bg-card p-3 text-sm leading-6">
              {review}
            </div>
          ) : null}
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
