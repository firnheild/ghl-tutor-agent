import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getModule, getPracticeGuide, getPracticeReview } from "@/lib/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const maxDuration = 30;

const ReviewSchema = z.object({
  builderNotes: z.string().trim().min(20).max(3000),
  moduleId: z.string().trim().min(1),
  practiceSteps: z.array(z.string()).max(20).default([]),
  screenshotProvided: z.boolean().default(false),
  testingNotes: z.string().trim().min(20).max(3000),
});

function getMaxOutputTokens() {
  const parsed = Number(process.env.MAX_OUTPUT_TOKENS ?? 650);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 650;
}

async function getAuthenticatedSupabase() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { error: "Supabase is not configured.", status: 503 as const };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to request saved AI review.", status: 401 as const };
  }

  return { supabase, user };
}

export async function POST(request: Request) {
  const auth = await getAuthenticatedSupabase();

  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY. Add it before using AI reviews." },
      { status: 503 },
    );
  }

  const body = ReviewSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      {
        error:
          "Add at least 20 characters for builder notes and testing notes before requesting review.",
      },
      { status: 400 },
    );
  }

  const [module, practiceGuide, practiceReview] = await Promise.all([
    getModule(body.data.moduleId),
    getPracticeGuide(body.data.moduleId),
    getPracticeReview(body.data.moduleId),
  ]);

  if (!module) {
    return NextResponse.json({ error: "Unknown lesson module." }, { status: 404 });
  }

  const submission = {
    builderNotes: body.data.builderNotes,
    expectedOutput: practiceGuide?.expectedOutput ?? [],
    practiceSteps: body.data.practiceSteps,
    rubric: practiceReview?.rubric ?? [],
    screenshotProvided: body.data.screenshotProvided,
    testingNotes: body.data.testingNotes,
  };

  const { data: reviewRow, error: insertError } = await auth.supabase
    .from("ai_reviews")
    .insert({
      module_id: module.id,
      status: "reviewing",
      submission,
      user_id: auth.user.id,
    })
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const result = await generateText({
    model: openai(process.env.OPENAI_MODEL ?? "gpt-4.1-mini"),
    system:
      "You are a warm but practical GoHighLevel instructor. Review beginner practice work using the provided rubric. Return concise feedback with: Rubric Score, Strengths, Fix Next, Testing Check, and Hire-Ready Tip. Do not invent screenshots or claim access to the student's GHL account.",
    prompt: [
      `Module: Level ${module.level} - ${module.title}`,
      `Outcome: ${module.outcome}`,
      `Practice example: ${practiceGuide?.example ?? "No guide available."}`,
      `Expected output: ${(practiceGuide?.expectedOutput ?? []).join(", ")}`,
      `Rubric:\n${
        practiceReview?.rubric
          .map(
            (item, index) =>
              `${index + 1}. ${item.criterion}\nPass: ${item.pass}\nStrong: ${item.excellent}`,
          )
          .join("\n\n") ?? "No rubric available."
      }`,
      `Hire-ready sample:\nBuilder notes: ${
        practiceReview?.samples.hireReady.builderNotes ?? "No sample available."
      }\nTesting notes: ${
        practiceReview?.samples.hireReady.testingNotes ?? "No sample available."
      }`,
      `Completed steps: ${body.data.practiceSteps.join(" | ") || "Not provided"}`,
      `Screenshot proof provided: ${body.data.screenshotProvided ? "yes" : "no"}`,
      `Builder notes:\n${body.data.builderNotes}`,
      `Testing notes:\n${body.data.testingNotes}`,
    ].join("\n\n"),
    maxOutputTokens: getMaxOutputTokens(),
    temperature: 0.3,
  });

  const { error: updateError } = await auth.supabase
    .from("ai_reviews")
    .update({
      review: result.text,
      status: "completed",
    })
    .eq("id", reviewRow.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ review: result.text });
}
