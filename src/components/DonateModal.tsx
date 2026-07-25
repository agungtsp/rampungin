"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

const SAWERIA_URL = "https://saweria.co/agungtsp";

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
        aria-label="Tutup donasi"
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
              Dukung Rampungin
            </h2>
            <p className="text-sm text-ink-muted">
              Prompt berhasil dihasilkan. Donasi sukarela membantu platform
              tetap gratis untuk semua.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full px-2.5 py-1 text-sm font-medium text-ink-muted transition hover:bg-soft hover:text-ink"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <a
          href={SAWERIA_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          <MoneyIcon className="h-5 w-5" />
          Donasi via Saweria
        </a>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-ink-muted transition hover:bg-soft hover:text-ink"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
