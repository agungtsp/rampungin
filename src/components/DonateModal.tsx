"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/lib/i18n";
import { getDonateLinks } from "@/lib/about";

type Props = {
  open: boolean;
  onClose: () => void;
};

function MoneyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

export function DonateModal({ open, onClose }: Props) {
  const { locale } = useLocale();
  const en = locale === "en";
  const links = getDonateLinks();
  const primary = links[0];

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50"
        aria-label={en ? "Close donation" : "Tutup donasi"}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donate-modal-title"
        className="relative z-10 w-full max-w-md animate-fade-up rounded-2xl bg-white p-5 shadow-card-hover ring-1 ring-black/[0.08] sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2
              id="donate-modal-title"
              className="font-display text-xl font-semibold tracking-tight text-ink"
            >
              {en ? "Support Rampungin" : "Dukung Rampungin"}
            </h2>
            <p className="text-sm text-ink-muted">
              {en
                ? "Prompt generated successfully. A voluntary donation helps keep the platform free for everyone."
                : "Prompt berhasil dihasilkan. Donasi sukarela membantu platform tetap gratis untuk semua."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-2.5 py-1 text-sm font-medium text-ink-muted transition hover:bg-soft hover:text-ink"
            aria-label={en ? "Close" : "Tutup"}
          >
            ✕
          </button>
        </div>

        {primary ? (
          <a
            href={primary.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            <MoneyIcon className="h-5 w-5" />
            {en
              ? primary.key === "saweria"
                ? "Donate via Saweria"
                : primary.label
              : primary.label}
          </a>
        ) : null}

        {links.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {links.slice(1).map((link) => (
              <a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="rounded-full bg-soft px-3 py-1.5 text-xs font-semibold text-ink ring-1 ring-secondary/50"
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-soft hover:text-ink"
          >
            {en ? "Close" : "Tutup"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
