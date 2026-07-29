"use client";

import { CATEGORIES, categoryLabel } from "@/lib/categories";
import { useLocale } from "@/lib/i18n";
import { CategoryIcon } from "./CategoryIcon";
import { LocaleLink } from "./LocaleLink";

type Props = {
  counts?: Record<string, number>;
  activeSlug?: string;
};

export function CategoryChips({ counts, activeSlug }: Props) {
  const { locale, t } = useLocale();

  return (
    <div className="border-b border-secondary bg-panel/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:px-6 sm:py-2.5 [&::-webkit-scrollbar]:hidden">
        <LocaleLink
          href="/"
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition sm:gap-1.5 sm:px-3.5 sm:text-sm ${
            !activeSlug
              ? "bg-primary text-white"
              : "border border-secondary bg-panel text-ink-muted hover:bg-soft hover:text-ink"
          }`}
        >
          <CategoryIcon name="squares-four" size={14} className="shrink-0" />
          {t("allCategories")}
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
                  : "border border-secondary bg-panel text-ink-muted hover:bg-soft hover:text-ink"
              }`}
            >
              <CategoryIcon name={c.icon} size={14} className="shrink-0" />
              <span>{categoryLabel(c.slug, locale)}</span>
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
