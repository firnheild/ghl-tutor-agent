import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getModules } from "@/lib/content";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/tutor-prompt";

export const maxDuration = 30;

const BodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
});

function getMaxOutputTokens() {
  const parsed = Number(process.env.MAX_OUTPUT_TOKENS ?? 650);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 650;
}

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      {
        error:
          "Missing OPENAI_API_KEY. Add it to .env.local to enable the tutor chat.",
      },
      { status: 400 },
    );
  }

  const body = BodySchema.safeParse(await req.json());

  if (!body.success) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const modules = await getModules();
  const curriculumContext = modules
    .map(
      (module) =>
        `Level ${module.level}: ${module.title} - ${module.description}`,
    )
    .join("\n");

  // This is the only MVP path that can incur model cost. Keep defaults concise
  // and make model/token limits configurable through server-only env vars.
  const result = streamText({
    model: openai(process.env.OPENAI_MODEL ?? "gpt-4.1-mini"),
    system: `${TUTOR_SYSTEM_PROMPT}\n\nCurriculum roadmap:\n${curriculumContext}`,
    messages: await convertToModelMessages(body.data.messages),
    maxOutputTokens: getMaxOutputTokens(),
    temperature: 0.4,
  });

  return result.toUIMessageStreamResponse();
}
