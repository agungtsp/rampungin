"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale, type Locale } from "@/lib/i18n";
import { localePath, stripLocalePrefix } from "@/lib/i18n/paths";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const pathname = usePathname();
  const [pending, setPending] = useState<Locale | null>(null);

  function pick(next: Locale) {
    if (next === locale || pending) return;
    setPending(next);
    setLocale(next);
    const { path } = stripLocalePrefix(pathname);
    const search = typeof window !== "undefined" ? window.location.search : "";
    // Hard navigation so server-rendered content reloads for the new locale
    window.location.assign(`${localePath(next, path)}${search}`);
  }

  return (
    <>
      {pending && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[2px]"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-ink shadow-card ring-1 ring-secondary/50">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
              aria-hidden
            />
            {pending === "en" ? "Switching to EN…" : "Beralih ke ID…"}
          </div>
        </div>
      )}

      <div
        className={`relative inline-flex items-center rounded-full bg-soft p-0.5 text-xs font-semibold ring-1 ring-secondary/40 ${
          pending ? "pointer-events-none opacity-70" : ""
        }`}
        role="group"
        aria-label="Language"
        aria-busy={pending != null}
      >
        <button
          type="button"
          disabled={pending != null}
          onClick={() => pick("id")}
          title="Bahasa Indonesia"
          aria-label="Bahasa Indonesia"
          className={`rounded-full px-2 py-1 transition disabled:cursor-wait ${
            (pending ?? locale) === "id"
              ? "bg-primary text-white"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {pending === "id" ? (
            <span
              className="mx-auto block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden
            />
          ) : (
            t("langId")
          )}
        </button>
        <button
          type="button"
          disabled={pending != null}
          onClick={() => pick("en")}
          title="English"
          aria-label="English"
          className={`rounded-full px-2 py-1 transition disabled:cursor-wait ${
            (pending ?? locale) === "en"
              ? "bg-primary text-white"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          {pending === "en" ? (
            <span
              className="mx-auto block h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden
            />
          ) : (
            t("langEn")
          )}
        </button>
      </div>
    </>
  );
}
