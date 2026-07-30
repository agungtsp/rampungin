import type { Metadata } from "next";
import { LabsIntakeForm } from "@/components/LabsIntakeForm";
import { LabsSuccessStories } from "@/components/LabsSuccessStories";
import {
  labsIntakeCopy,
  labsSeoCopy,
  labsStories,
} from "@/lib/labs-content";
import { getServerLocale } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = labsSeoCopy(locale);
  return buildPageMetadata({
    locale,
    barePath: "/labs",
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

export default async function LabsPage() {
  const locale = await getServerLocale();
  const copy = labsSeoCopy(locale);
  const formCopy = labsIntakeCopy(locale);
  const stories = labsStories(locale);

  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 10% 0%, rgba(6,182,212,0.22), transparent 55%), radial-gradient(ellipse 55% 45% at 90% 10%, rgba(16,185,129,0.16), transparent 50%), radial-gradient(ellipse 50% 40% at 80% 100%, rgba(139,92,246,0.18), transparent 55%)",
        }}
      />

      <section className="mx-auto max-w-5xl px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-16">
        <p className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-violet-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-hover ring-1 ring-primary/25">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {copy.eyebrow}
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.08]">
          {copy.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          {copy.subtitle}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#labs-form"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
          >
            {copy.cta}
          </a>
          <p className="text-sm text-ink-faint">{copy.ctaHint}</p>
        </div>
      </section>

      <LabsSuccessStories
        stories={stories}
        title={copy.storiesTitle}
        subtitle={copy.storiesSub}
        beforeLabel={copy.before}
        afterLabel={copy.after}
      />

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {copy.pillarsTitle}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {copy.pillars.map((p) => (
            <article
              key={p.title}
              className="overflow-hidden rounded-2xl bg-panel p-5 shadow-card ring-1 ring-secondary"
            >
              <div
                className={`mb-4 h-1.5 w-14 rounded-full bg-gradient-to-r ${p.tone}`}
              />
              <h3 className="font-display text-lg font-semibold text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {copy.whoTitle}
            </h2>
            <ul className="mt-4 space-y-3">
              {copy.who.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-xl bg-panel/80 px-4 py-3 text-sm text-ink-muted ring-1 ring-secondary"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {copy.howTitle}
            </h2>
            <ol className="mt-4 space-y-4">
              {copy.how.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="bg-gradient-to-b from-cyan-500 to-emerald-600 bg-clip-text font-display text-2xl font-bold text-transparent">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <LabsIntakeForm locale={locale} copy={formCopy} />

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-emerald-600 to-violet-700 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl"
          />
          <h2 className="relative max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {copy.closeTitle}
          </h2>
          <p className="relative mt-3 max-w-xl text-sm text-white/85 sm:text-base">
            {copy.closeBody}
          </p>
          <a
            href="#labs-form"
            className="relative mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-800 shadow-md transition hover:bg-cyan-50"
          >
            {copy.cta}
          </a>
        </div>
      </section>
    </main>
  );
}
