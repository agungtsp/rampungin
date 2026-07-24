"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { DonateOptions } from "@/components/DonateOptions";

type Props = {
  open: boolean;
  onClose: () => void;
};

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
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto animate-fade-up rounded-2xl bg-white p-5 shadow-card-hover ring-1 ring-black/[0.08] sm:p-6"
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
              Prompt berhasil dihasilkan. Scan QR di bawah untuk donasi
              sukarela — platform tetap gratis untuk semua.
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

        <div className="mt-5">
          <DonateOptions compact onNavigate={onClose} />
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
