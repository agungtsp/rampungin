"use client";

import { usePathname } from "next/navigation";
import { useLocale, type Locale } from "@/lib/i18n";
import { localePath, stripLocalePrefix } from "@/lib/i18n/paths";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();

  function pick(next: Locale) {
    if (next === locale) return;
    setLocale(next);
    const { path } = stripLocalePrefix(pathname);
    const search = typeof window !== "undefined" ? window.location.search : "";
    // Hard navigation so server-rendered content reloads for the new locale
    window.location.assign(`${localePath(next, path)}${search}`);
  }

  return (
    <div
      className="inline-flex items-center rounded-full bg-soft p-0.5 text-xs font-semibold ring-1 ring-secondary/40"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => pick("id")}
        className={`rounded-full px-2 py-1 transition ${
          locale === "id"
            ? "bg-primary text-white"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        {t("langId")}
      </button>
      <button
        type="button"
        onClick={() => pick("en")}
        className={`rounded-full px-2 py-1 transition ${
          locale === "en"
            ? "bg-primary text-white"
            : "text-ink-muted hover:text-ink"
        }`}
      >
        {t("langEn")}
      </button>
    </div>
  );
}
