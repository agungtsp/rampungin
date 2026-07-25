"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import { getTermsCopy, termsCheckboxLabel } from "@/lib/i18n/terms-content";
import { LocaleLink } from "./LocaleLink";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function TermsAcceptance({ checked, onChange }: Props) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const copy = getTermsCopy(locale);

  return (
    <div className="space-y-2 rounded-xl bg-soft/80 p-4 ring-1 ring-secondary/50">
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-secondary text-primary"
          required
        />
        <span>
          {termsCheckboxLabel(locale)}{" "}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-semibold text-primary underline"
          >
            {locale === "en" ? "Read full terms" : "Baca selengkapnya"}
          </button>
          {" · "}
          <LocaleLink
            href="/terms"
            className="font-medium text-primary-hover underline"
          >
            {locale === "en" ? "Open page" : "Buka halaman"}
          </LocaleLink>
        </span>
      </label>

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-card-hover"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2
                id="terms-modal-title"
                className="font-display text-xl font-semibold text-ink"
              >
                {copy.title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-ink-muted hover:bg-soft"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs text-ink-muted">{copy.updated}</p>
            <p className="mb-4 text-sm leading-relaxed text-ink-muted">
              {copy.intro}
            </p>
            <div className="space-y-4">
              {copy.sections.map((s) => (
                <section key={s.heading}>
                  <h3 className="text-sm font-semibold text-ink">{s.heading}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {s.body}
                  </p>
                </section>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                onChange(true);
                setOpen(false);
              }}
              className="mt-5 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              {locale === "en"
                ? "I acknowledge and agree"
                : "Saya mengakui dan menyetujui"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
