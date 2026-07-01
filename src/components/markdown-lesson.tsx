function renderInline(text: string) {
  return text.replaceAll("**", "");
}

export function MarkdownLesson({ markdown }: { markdown: string }) {
  const lines = markdown.split(/\r?\n/);

  return (
    <article className="space-y-4">
      {lines.map((line, index) => {
        const key = `${index}-${line.slice(0, 12)}`;

        if (!line.trim()) {
          return null;
        }

        if (line.startsWith("# ")) {
          return (
            <h1 key={key} className="text-3xl font-semibold tracking-normal">
              {renderInline(line.replace("# ", ""))}
            </h1>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <h2 key={key} className="pt-4 text-xl font-semibold">
              {renderInline(line.replace("## ", ""))}
            </h2>
          );
        }

        if (/^\d+\.\s/.test(line)) {
          return (
            <p key={key} className="rounded-md border bg-muted/40 px-3 py-2 text-sm">
              {renderInline(line)}
            </p>
          );
        }

        if (line.startsWith("- ")) {
          return (
            <p key={key} className="flex gap-2 text-sm text-muted-foreground">
              <span className="mt-2 size-1.5 rounded-full bg-emerald-600" />
              <span>{renderInline(line.replace("- ", ""))}</span>
            </p>
          );
        }

        return (
          <p key={key} className="leading-7 text-muted-foreground">
            {renderInline(line)}
          </p>
        );
      })}
    </article>
  );
}
