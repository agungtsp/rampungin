"use client";

import { useLocale } from "@/lib/i18n";
import { LocaleLink } from "./LocaleLink";
import { RampunginLogo } from "./RampunginLogo";

export function SiteFooter() {
  const { t, locale } = useLocale();

  return (
    <footer className="mt-auto border-t border-secondary/60 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-start gap-3">
          <RampunginLogo className="mt-0.5 h-9 w-9 shrink-0" />
          <div>
            <p className="font-display text-sm font-semibold text-ink">
              Rampungin
            </p>
            <p className="mt-0.5 text-sm text-ink-muted">
              {locale === "en"
                ? "Free AI prompt marketplace for everyone."
                : "Marketplace prompt AI gratis untuk semua."}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm text-ink-muted">
          <LocaleLink href="/trending" className="transition hover:text-ink">
            {t("navTrending")}
          </LocaleLink>
          <LocaleLink href="/people" className="transition hover:text-ink">
            {t("navCreators")}
          </LocaleLink>
          <LocaleLink href="/tutorial" className="transition hover:text-ink">
            {t("navGuide")}
          </LocaleLink>
          <LocaleLink href="/about" className="transition hover:text-ink">
            {t("navAbout")}
          </LocaleLink>
          <LocaleLink href="/about#donasi" className="transition hover:text-ink">
            {locale === "en" ? "Donate" : "Donasi"}
          </LocaleLink>
          <LocaleLink href="/prompts/new" className="transition hover:text-ink">
            {t("navCreate")}
          </LocaleLink>
        </nav>
      </div>
    </footer>
  );
}
