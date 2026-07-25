"use client";

import { CATEGORIES } from "@/lib/categories";
import { useLocale } from "@/lib/i18n";
import { LocaleLink } from "./LocaleLink";

type Props = {
  counts?: Record<string, number>;
  activeSlug?: string;
};

export function CategoryChips({ counts, activeSlug }: Props) {
  const { locale } = useLocale();

  return (
    <div className="border-b border-secondary/60 bg-white">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-6 sm:py-2.5 [&::-webkit-scrollbar]:hidden">
        <LocaleLink
          href="/"
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-3.5 sm:text-sm ${
            !activeSlug
              ? "bg-primary text-white"
              : "text-ink-muted hover:bg-soft hover:text-ink"
          }`}
        >
          {locale === "en" ? "All" : "Semua"}
        </LocaleLink>
        {CATEGORIES.map((c) => {
          const active = c.slug === activeSlug;
          const count = counts?.[c.slug];
          return (
            <LocaleLink
              key={c.slug}
              href={`/category/${c.slug}`}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition sm:gap-1.5 sm:px-3.5 sm:text-sm ${
                active
                  ? "bg-primary text-white"
                  : "text-ink-muted hover:bg-soft hover:text-ink"
              }`}
            >
              <span aria-hidden>{c.emoji}</span>
              <span>{c.label}</span>
              {count != null ? (
                <span
                  className={`tabular-nums text-[10px] sm:text-[11px] ${
                    active ? "text-white/70" : "text-ink-faint"
                  }`}
                >
                  {count}
                </span>
              ) : null}
            </LocaleLink>
          );
        })}
      </div>
    </div>
  );
}
