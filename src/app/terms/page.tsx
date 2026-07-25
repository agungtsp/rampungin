import type { Metadata } from "next";
import { getTermsCopy } from "@/lib/i18n/terms-content";
import { getServerLocale } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getTermsCopy(locale);
  return buildPageMetadata({
    locale,
    barePath: "/terms",
    title: copy.metaTitle.replace(/\s*[—|-]\s*Rampungin$/i, ""),
    description: copy.metaDescription,
  });
}

export default async function TermsPage() {
  const locale = await getServerLocale();
  const copy = getTermsCopy(locale);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {copy.title}
        </h1>
        <p className="text-sm text-ink-muted">{copy.updated}</p>
      </header>
      <p className="text-base leading-relaxed text-ink-muted">{copy.intro}</p>
      <div className="space-y-6">
        {copy.sections.map((s) => (
          <section key={s.heading} className="space-y-2">
            <h2 className="text-lg font-semibold text-ink">{s.heading}</h2>
            <p className="text-base leading-relaxed text-ink-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
