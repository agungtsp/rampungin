import Link from "next/link";
import type { Metadata } from "next";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CATEGORIES } from "@/lib/categories";
import { getTutorialCopy } from "@/lib/i18n/tutorial-content";
import { localePath } from "@/lib/i18n/paths";
import { getServerLocale } from "@/lib/i18n/server";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getTutorialCopy(locale);
  return buildPageMetadata({
    locale,
    barePath: "/tutorial",
    title: copy.metaTitle.replace(/\s*[—|-]\s*Rampungin$/i, ""),
    description: copy.metaDescription,
  });
}

type Step = {
  title: string;
  body: string;
  points?: string[];
};

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="flex gap-4 rounded-2xl border border-primary/10 bg-white p-4 shadow-card"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-hover text-sm font-semibold text-white">
            {i + 1}
          </span>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">{s.title}</h3>
            <p className="text-sm text-ink-muted">{s.body}</p>
            {s.points && (
              <ul className="ml-1 space-y-1 text-sm text-ink-muted">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Section({
  emoji,
  title,
  subtitle,
  children,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <span>{emoji}</span>
          {title}
        </h2>
        <p className="text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default async function TutorialPage() {
  const locale = await getServerLocale();
  const copy = getTutorialCopy(locale);
  const home = localePath(locale, "/");
  const newPrompt = localePath(locale, "/prompts/new");
  const trending = localePath(locale, "/trending");

  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-10">
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-hover via-primary to-secondary px-6 py-12 text-white shadow-card sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative space-y-4">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {copy.badge}
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {copy.heroTitle}
          </h1>
          <p className="max-w-xl text-white/90">{copy.heroBody}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={home}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-soft"
            >
              {copy.startBrowse}
            </Link>
            <Link
              href={newPrompt}
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm transition hover:bg-white/10"
            >
              {copy.createPrompt}
            </Link>
          </div>
        </div>
      </section>

      <Section
        emoji="🔎"
        title={copy.sections.browse.title}
        subtitle={copy.sections.browse.subtitle}
      >
        <StepList steps={copy.sections.browse.steps} />
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={localePath(locale, `/category/${c.slug}`)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/12 bg-white px-3 py-1.5 text-sm text-ink shadow-sm transition hover:border-secondary hover:bg-soft"
            >
              <CategoryIcon name={c.icon} size={14} className="shrink-0" />
              {c.label}
            </Link>
          ))}
        </div>
      </Section>

      <Section
        emoji="📋"
        title={copy.sections.copy.title}
        subtitle={copy.sections.copy.subtitle}
      >
        <StepList steps={copy.sections.copy.steps} />
      </Section>

      <Section
        emoji="✨"
        title={copy.sections.create.title}
        subtitle={copy.sections.create.subtitle}
      >
        <StepList steps={copy.sections.create.steps} />
      </Section>

      <Section
        emoji="💬"
        title={copy.sections.social.title}
        subtitle={copy.sections.social.subtitle}
      >
        <StepList steps={copy.sections.social.steps} />
      </Section>

      <section className="rounded-2xl border border-primary/10 bg-soft/60 p-6 text-center">
        <h2 className="text-xl font-bold text-ink">{copy.ctaTitle}</h2>
        <p className="mt-1 text-ink-muted">{copy.ctaBody}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href={newPrompt}
            className="rounded-full bg-primary-hover px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
          >
            {copy.ctaCreate}
          </Link>
          <Link
            href={trending}
            className="rounded-full border border-primary-hover px-5 py-2.5 text-sm font-medium text-primary-hover transition hover:bg-soft"
          >
            {copy.ctaTrending}
          </Link>
        </div>
      </section>
    </main>
  );
}
