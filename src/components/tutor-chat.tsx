"use client";

import { Fragment, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { Bot, ClipboardCheck, MessageSquare, Send } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";

const modePrompts = [
  "Explain like I'm new",
  "Give me a real client example",
  "Check my answer",
  "Make me hire-ready",
  "Interview prep",
  "Troubleshoot my workflow",
];

export function TutorChat() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();

  const openingPrompt = useMemo(() => {
    const mode = searchParams.get("mode");
    const scenario = searchParams.get("scenario");

    if (mode === "client-simulation") {
      return `Run a client simulation for scenario ${scenario}. Ask me one requirement question first.`;
    }

    return "Diagnose my current GHL level and give me the first practical step.";
  }, [searchParams]);

  function handleSubmit(message: PromptInputMessage) {
    const text = message.text.trim();

    if (!text) {
      return;
    }

    sendMessage({ text });
    setInput("");
  }

  function sendQuickPrompt(prompt: string) {
    sendMessage({ text: prompt });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="flex h-[720px] flex-col rounded-lg border bg-card p-4">
        <Conversation className="min-h-0 flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<Bot className="size-12" />}
                title="Start with one question"
                description="The tutor teaches one concept, one example, one action step, and one check question."
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, index) => {
                      if (part.type !== "text") {
                        return null;
                      }

                      return (
                        <MessageResponse key={`${message.id}-${index}`}>
                          {part.text}
                        </MessageResponse>
                      );
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {error ? (
          <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error.message}
          </p>
        ) : null}

        <PromptInput onSubmit={handleSubmit} className="relative mt-4">
          <PromptInputTextarea
            value={input}
            onChange={(event) => setInput(event.currentTarget.value)}
            placeholder="Ask about tags, pipelines, calendars, workflows, funnels, or client tasks..."
            className="min-h-24 pr-12"
          />
          <PromptInputSubmit
            status={status === "streaming" ? "streaming" : "ready"}
            disabled={!input.trim()}
            className="absolute bottom-2 right-2"
          />
        </PromptInput>
      </section>

      <aside className="space-y-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-emerald-700" />
            <h2 className="font-semibold">Quick start</h2>
          </div>
          <button
            className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-left text-sm text-primary-foreground"
            onClick={() => sendQuickPrompt(openingPrompt)}
          >
            {openingPrompt}
          </button>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="size-5 text-emerald-700" />
            <h2 className="font-semibold">Tutor modes</h2>
          </div>
          <div className="mt-4 grid gap-2">
            {modePrompts.map((prompt) => (
              <Fragment key={prompt}>
                <button
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => sendQuickPrompt(prompt)}
                >
                  {prompt}
                  <Send className="size-3" />
                </button>
              </Fragment>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
