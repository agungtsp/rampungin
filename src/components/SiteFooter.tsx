"use client";

import { useLocale } from "@/lib/i18n";
import { LocaleLink } from "./LocaleLink";
import { RampunginLogo } from "./RampunginLogo";

const AUTHOR_URL = "https://agungtsp.github.io";

export function SiteFooter() {
  const { t, locale } = useLocale();
  const year = new Date().getFullYear();
  const linkClass = "transition hover:text-ink";

  return (
    <footer className="mt-auto border-t border-secondary bg-panel text-ink-muted">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <RampunginLogo className="mt-0.5 h-9 w-9 shrink-0" />
            <div>
              <p className="font-display text-sm font-semibold text-ink">
                Rampungin
              </p>
              <p className="mt-0.5 max-w-sm text-sm text-ink-muted">
                {locale === "en"
                  ? "Free AI prompt marketplace — and Labs for AI transformation ideas."
                  : "Marketplace prompt AI gratis — dan Labs untuk ide transformasi AI."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">
                {locale === "en" ? "Explore" : "Jelajah"}
              </p>
              <nav className="mt-2 flex flex-col gap-2 text-sm">
                <LocaleLink href="/" className={linkClass}>
                  {t("navHome")}
                </LocaleLink>
                <LocaleLink href="/trending" className={linkClass}>
                  {t("navTrending")}
                </LocaleLink>
                <LocaleLink href="/labs" className={linkClass}>
                  {t("navLabs")}
                </LocaleLink>
                <LocaleLink href="/prompts/new" className={linkClass}>
                  {t("navCreate")}
                </LocaleLink>
              </nav>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">
                {locale === "en" ? "Discover" : "Temukan"}
              </p>
              <nav className="mt-2 flex flex-col gap-2 text-sm">
                <LocaleLink href="/editor-picks" className={linkClass}>
                  {t("navEditorPicks")}
                </LocaleLink>
                <LocaleLink href="/people" className={linkClass}>
                  {t("navCreators")}
                </LocaleLink>
                <LocaleLink href="/tutorial" className={linkClass}>
                  {t("navGuide")}
                </LocaleLink>
              </nav>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink">
                {locale === "en" ? "Company" : "Lainnya"}
              </p>
              <nav className="mt-2 flex flex-col gap-2 text-sm">
                <LocaleLink href="/about" className={linkClass}>
                  {t("navAbout")}
                </LocaleLink>
                <LocaleLink href="/about#donasi" className={linkClass}>
                  {locale === "en" ? "Donate" : "Donasi"}
                </LocaleLink>
                <LocaleLink href="/terms" className={linkClass}>
                  {locale === "en" ? "Terms" : "Syarat & Ketentuan"}
                </LocaleLink>
              </nav>
            </div>
          </div>
        </div>
        <p className="border-t border-secondary pt-4 text-xs sm:text-sm">
          <a
            href={AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition hover:text-ink hover:underline"
          >
            © {year} {locale === "en" ? "by" : "oleh"} agungtsp
          </a>
        </p>
      </div>
    </footer>
  );
}
