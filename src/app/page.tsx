import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Route,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatCard } from "@/components/stat-card";
import { getModules, getProjects } from "@/lib/content";

export default async function Home() {
  const [modules, projects] = await Promise.all([getModules(), getProjects()]);
  const seededLessons = modules.filter((module) => module.seeded).length;

  return (
    <AppShell>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-1 text-sm text-muted-foreground">
            <GraduationCap className="size-4 text-emerald-600" />
            Beginner to hire-ready GoHighLevel skills
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              GHL Tutor Agent
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              A practical learning portal for complete beginners who want to
              become useful GoHighLevel VAs, CRM assistants, funnel builders,
              and automation specialists.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/learn"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
            >
              Start learning <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/agent"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border bg-background px-5 text-sm font-medium"
            >
              Open tutor chat <Bot className="size-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today&apos;s track</p>
              <h2 className="text-xl font-semibold">CRM Foundations</h2>
            </div>
            <BadgeCheck className="size-8 text-emerald-600" />
          </div>
          <div className="space-y-3">
            {[
              "Learn one GHL concept in plain English",
              "Complete a short client-style practice task",
              "Answer a check question before moving on",
              "Save portfolio notes for hiring profiles",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-md border bg-background px-3 py-3 text-sm"
              >
                <ClipboardCheck className="size-4 text-emerald-600" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Route} label="Learning levels" value={modules.length} />
        <StatCard icon={Layers} label="Seed lessons" value={seededLessons} />
        <StatCard
          icon={BriefcaseBusiness}
          label="Portfolio projects"
          value={projects.length}
        />
        <StatCard icon={Bot} label="Tutor modes" value={8} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {modules.slice(0, 3).map((module) => (
          <Link
            key={module.id}
            href={`/lesson/${module.id}`}
            className="rounded-lg border bg-card p-5 transition hover:border-emerald-500"
          >
            <p className="text-sm font-medium text-emerald-700">
              Level {module.level}
            </p>
            <h3 className="mt-2 text-xl font-semibold">{module.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {module.description}
            </p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
