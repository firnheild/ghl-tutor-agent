import { AppShell } from "@/components/app-shell";
import { getGlossary } from "@/lib/content";

export default async function GlossaryPage() {
  const terms = await getGlossary();
  const categories = Array.from(new Set(terms.map((term) => term.category)));

  return (
    <AppShell>
      <section className="space-y-2">
        <p className="text-sm font-medium text-emerald-700">
          Zero-knowledge glossary
        </p>
        <h1 className="text-3xl font-semibold">GHL terms in plain English</h1>
        <p className="max-w-3xl text-muted-foreground">
          Start here whenever a lesson uses a word you do not know yet. These
          definitions are written for complete beginners.
        </p>
      </section>

      <section className="space-y-8">
        {categories.map((category) => (
          <div key={category} className="space-y-3">
            <h2 className="text-xl font-semibold">{category}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {terms
                .filter((term) => term.category === category)
                .map((term) => (
                  <article
                    key={term.term}
                    className="rounded-lg border bg-card p-5"
                  >
                    <h3 className="text-lg font-semibold">{term.term}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {term.definition}
                    </p>
                    <p className="mt-3 rounded-md border bg-muted/40 p-3 text-sm">
                      Example: {term.example}
                    </p>
                  </article>
                ))}
            </div>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
