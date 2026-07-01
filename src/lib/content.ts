import { promises as fs } from "node:fs";
import path from "node:path";

export type Module = {
  id: string;
  level: number;
  title: string;
  description: string;
  outcome: string;
  lesson: string;
  seeded: boolean;
};

export type QuizQuestion = {
  id: string;
  moduleId: string;
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export type Scenario = {
  id: string;
  business: string;
  brief: string;
  task: string;
  expected: string[];
};

export type Project = {
  id: string;
  title: string;
  deliverables: string[];
  caseStudyPrompt: string;
};

const contentDir = path.join(process.cwd(), "content");

async function readJson<T>(relativePath: string): Promise<T> {
  const raw = await fs.readFile(path.join(contentDir, relativePath), "utf8");
  return JSON.parse(raw) as T;
}

export async function getModules() {
  return readJson<Module[]>("modules.json");
}

export async function getModule(moduleId: string) {
  const modules = await getModules();
  return modules.find((module) => module.id === moduleId);
}

export async function getLessonMarkdown(moduleId: string) {
  const currentModule = await getModule(moduleId);

  if (!currentModule || !currentModule.seeded) {
    return null;
  }

  return fs.readFile(
    path.join(contentDir, "lessons", currentModule.lesson),
    "utf8",
  );
}

export async function getQuizzes() {
  return readJson<QuizQuestion[]>("quizzes/foundation.json");
}

export async function getScenarios() {
  return readJson<Scenario[]>("scenarios/local-business.json");
}

export async function getProjects() {
  return readJson<Project[]>("projects/portfolio.json");
}
