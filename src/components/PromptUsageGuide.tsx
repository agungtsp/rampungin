import type { Locale } from "@/lib/i18n/locale";
import { resolveUsageGuide } from "@/lib/usage-guide";
import type { AiPlatform } from "@/lib/ai-platform";

type Props = {
  locale: Locale;
  aiPlatform?: AiPlatform | string | null;
  usageGuide?: string | null;
  usageGuideEn?: string | null;
};

export function PromptUsageGuide({
  locale,
  aiPlatform,
  usageGuide,
  usageGuideEn,
}: Props) {
  const guide = resolveUsageGuide(
    locale,
    aiPlatform,
    usageGuide,
    usageGuideEn,
  );

  return (
    <section className="space-y-3 rounded-2xl bg-soft/70 p-5 ring-1 ring-secondary/50">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-hover">
          {locale === "en" ? "Tutorial" : "Tutorial"}
        </p>
        <h2 className="font-display text-xl font-semibold text-ink">
          {guide.title}
        </h2>
        <p className="text-sm text-ink-muted">{guide.platformNote}</p>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-ink-muted whitespace-pre-wrap">
        {guide.body}
      </div>
    </section>
  );
}
