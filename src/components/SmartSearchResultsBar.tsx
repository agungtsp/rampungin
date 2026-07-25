"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { openSmartSearch } from "@/components/SmartSearchModal";
import { useLocale } from "@/lib/i18n";

type Props = {
  note: string | null;
  query: string;
};

export function SmartSearchResultsBar({ note, query }: Props) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-soft px-4 py-3 ring-1 ring-primary/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-0.5">
        <p className="truncate text-sm font-medium text-ink">
          {t("searchResultsFor")}{" "}
          <span className="font-normal text-ink-muted">“{query}”</span>
        </p>
        {note ? <p className="text-sm text-primary-hover">{note}</p> : null}
      </div>
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openSmartSearch()}
          className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-ink ring-1 ring-secondary/50 transition hover:bg-soft"
        >
          {t("searchChange")}
        </button>
        <LocaleLink
          href="/"
          className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          {t("searchClear")}
        </LocaleLink>
      </div>
    </div>
  );
}
