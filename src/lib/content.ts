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

export type GlossaryTerm = {
  term: string;
  category: string;
  definition: string;
  example: string;
};

export type VisualSnippet = {
  moduleId: string;
  title: string;
  image: string;
  caption: string;
  lookFor: string[];
};

export type PracticeGuide = {
  moduleId: string;
  title: string;
  image: string;
  example: string;
  steps: string[];
  expectedOutput: string[];
  screenshotPrompt: string;
  testingNotes: string;
};

export type PracticeReviewSample = {
  builderNotes: string;
  testingNotes: string;
  whyItWorks: string;
};

export type PracticeReview = {
  moduleId: string;
  rubric: {
    criterion: string;
    pass: string;
    excellent: string;
  }[];
  samples: {
    beginner: PracticeReviewSample;
    hireReady: PracticeReviewSample;
    needsImprovement: PracticeReviewSample;
  };
};

const contentDir = path.join(process.cwd(), "content");

const moduleGlossaryTerms: Record<string, string[]> = {
  orientation: [
    "Lead",
    "CRM",
    "Form",
    "Funnel",
    "Call",
    "Ad",
    "Referral",
  ],
  "crm-foundations": [
    "Contact",
    "Lead",
    "Tag",
    "Custom Field",
    "Smart List",
    "Note",
    "Task",
  ],
  "pipeline-sales": [
    "Pipeline",
    "Opportunity",
    "Stage",
    "Lead Status",
    "Manual Movement",
    "Automated Movement",
    "Sales Process",
  ],
  "calendar-booking": [
    "Calendar",
    "Appointment",
    "Availability",
    "Buffer",
    "Booking Link",
    "Appointment Reminder",
    "No-Show",
  ],
  "forms-funnels": [
    "Form",
    "Field",
    "Survey",
    "Funnel",
    "Landing Page",
    "Lead Magnet",
    "Thank-You Page",
  ],
  communication: [
    "Conversations Inbox",
    "SMS",
    "Email Template",
    "Follow-Up",
    "Reply Handling",
    "Lead Nurture",
    "Opt-Out",
  ],
  "workflow-automations": [
    "Workflow",
    "Trigger",
    "Action",
    "Wait Step",
    "Condition",
    "If/Else Branch",
    "Stop Rule",
  ],
  "client-implementation": [
    "Client Requirements",
    "Process Map",
    "Testing Checklist",
    "Launch QA",
    "Troubleshooting",
    "Mock Data",
    "Handoff",
  ],
  "advanced-practical": [
    "Integration",
    "Webhook",
    "API",
    "Make",
    "n8n",
    "Zapier",
    "Secret",
  ],
  "hire-ready-portfolio": [
    "Portfolio Project",
    "Case Study",
    "Resume Bullet",
    "Interview Prep",
    "Scope",
    "Deliverable",
    "Self-Issued Certificate",
  ],
};

function buildGlossaryReviewQuestions(
  moduleId: string,
  existingQuestions: QuizQuestion[],
  glossary: GlossaryTerm[],
) {
  const existingCount = existingQuestions.filter(
    (question) => question.moduleId === moduleId,
  ).length;

  if (existingCount >= 10) {
    return [];
  }

  const terms = moduleGlossaryTerms[moduleId] ?? [];
  const glossaryByTerm = new Map(glossary.map((item) => [item.term, item]));
  const allTerms = glossary.map((item) => item.term);

  return terms
    .slice(0, 10 - existingCount)
    .map((term, index): QuizQuestion | null => {
      const glossaryTerm = glossaryByTerm.get(term);

      if (!glossaryTerm) {
        return null;
      }

      const distractors = allTerms
        .filter((candidate) => candidate !== term)
        .slice(index, index + 3);
      const definition = sanitizeDefinition(glossaryTerm.definition, term);

      return {
        id: `${moduleId}-term-${index + 1}`,
        moduleId,
        question: `Which glossary term matches this definition: ${definition}`,
        choices: [term, ...distractors],
        answer: term,
        explanation: `${term}: ${glossaryTerm.example}`,
      };
    })
    .filter((question): question is QuizQuestion => Boolean(question));
}

function sanitizeDefinition(definition: string, term: string) {
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const maybePlural = /^[A-Za-z]+$/.test(term) && !term.endsWith("s") ? "s?" : "";
  const termPattern = new RegExp(`\\b${escapedTerm}${maybePlural}\\b`, "gi");

  return definition.replace(termPattern, "this concept");
}

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
  const [modules, authoredQuestions, glossary] = await Promise.all([
    getModules(),
    readJson<QuizQuestion[]>("quizzes/foundation.json"),
    getGlossary(),
  ]);
  const generatedQuestions = modules.flatMap((module) =>
    buildGlossaryReviewQuestions(module.id, authoredQuestions, glossary),
  );

  return [...authoredQuestions, ...generatedQuestions];
}

export async function getScenarios() {
  return readJson<Scenario[]>("scenarios/local-business.json");
}

export async function getProjects() {
  return readJson<Project[]>("projects/portfolio.json");
}

export async function getGlossary() {
  return readJson<GlossaryTerm[]>("glossary.json");
}

export async function getVisualSnippets(moduleId: string) {
  const snippets = await readJson<VisualSnippet[]>("visual-snippets.json");
  return snippets.filter((snippet) => snippet.moduleId === moduleId);
}

export async function getPracticeGuide(moduleId: string) {
  const guides = await readJson<PracticeGuide[]>("practice-guides.json");
  return guides.find((guide) => guide.moduleId === moduleId);
}

export async function getPracticeReview(moduleId: string) {
  const reviews = await readJson<PracticeReview[]>("practice-reviews.json");
  return reviews.find((review) => review.moduleId === moduleId);
}
