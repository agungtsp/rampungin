"use client";

import { useLocale } from "@/lib/i18n";

export function FreeBadge({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useLocale();
  if (compact) {
    return (
      <span className="hidden rounded-md bg-soft px-2 py-0.5 text-[11px] font-semibold text-primary md:inline-flex">
        {t("free")}
      </span>
    );
  }

  return (
    <p className="text-sm font-medium text-ink-muted">
      {locale === "en"
        ? "Free forever · share without limits"
        : "Gratis selamanya · bagikan tanpa batas"}
    </p>
  );
}
