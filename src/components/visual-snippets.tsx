import Image from "next/image";
import { Camera, ShieldCheck } from "lucide-react";
import type { VisualSnippet } from "@/lib/content";

export function VisualSnippets({ snippets }: { snippets: VisualSnippet[] }) {
  if (snippets.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Visual walkthrough
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            See the tool before doing the task
          </h2>
        </div>
        <Camera className="size-5 text-emerald-700" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {snippets.map((snippet) => (
          <article key={snippet.title} className="rounded-lg border bg-background p-4">
            <div className="overflow-hidden rounded-md border bg-muted">
              <Image
                src={snippet.image}
                alt={snippet.title}
                width={1200}
                height={720}
                className="h-auto w-full"
              />
            </div>
            <h3 className="mt-4 font-semibold">{snippet.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {snippet.caption}
            </p>
            <div className="mt-3 rounded-md border bg-muted/40 p-3">
              <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="size-4 text-emerald-700" />
                What to look for
              </p>
              <div className="flex flex-wrap gap-2">
                {snippet.lookFor.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border bg-background px-2 py-1 text-xs text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
