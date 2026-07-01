import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, ClipboardCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { CourseSidebar } from "@/components/course-sidebar";
import { MarkdownLesson } from "@/components/markdown-lesson";
import { getLessonMarkdown, getModule, getModules } from "@/lib/content";

export async function generateStaticParams() {
  const modules = await getModules();
  return modules.map((module) => ({ moduleId: module.id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const [module, markdown, modules] = await Promise.all([
    getModule(moduleId),
    getLessonMarkdown(moduleId),
    getModules(),
  ]);

  if (!module) {
    notFound();
  }

  return (
    <AppShell>
      <Link
        href="/learn"
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to roadmap
      </Link>

      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <CourseSidebar modules={modules} activeModuleId={module.id} />

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="size-5 text-emerald-700" />
              <h2 className="font-semibold">Lesson actions</h2>
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href="/practice"
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Generate practice task
              </Link>
              <Link
                href="/quiz"
                className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
              >
                Take quiz
              </Link>
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              >
                Ask tutor <Bot className="size-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">
              Hire-ready outcome
            </p>
            <p className="mt-2 text-sm leading-6">{module.outcome}</p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            {markdown ? (
              <MarkdownLesson markdown={markdown} />
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-medium text-emerald-700">
                  Level {module.level}
                </p>
                <h1 className="text-3xl font-semibold">{module.title}</h1>
                <p className="leading-7 text-muted-foreground">
                  {module.description}
                </p>
                <p className="rounded-md border bg-muted/50 p-4 text-sm">
                  This module is mapped for the full curriculum. Add a markdown
                  file in <code>content/lessons/{module.lesson}</code> to seed
                  the complete lesson.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
