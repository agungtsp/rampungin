"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";

export const OPEN_SMART_SEARCH_EVENT = "rampungin:open-smart-search";

export function openSmartSearch() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_SMART_SEARCH_EVENT));
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function SmartSearchButton({
  variant = "icon",
}: {
  variant?: "icon" | "bar";
}) {
  const router = useRouter();
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const titleId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => triggerRef.current?.focus());
  }, []);

  const openModal = useCallback(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setQ(sp.get("q") ?? "");
      setTag(sp.get("tag") ?? "");
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    function onOpen() {
      openModal();
    }
    window.addEventListener(OPEN_SMART_SEARCH_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_SMART_SEARCH_EVENT, onOpen);
  }, [openModal]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => textareaRef.current?.focus(), 0);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const intent = q.trim();
    if (!intent) return;
    const sp = new URLSearchParams();
    sp.set("q", intent);
    const t = tag.trim();
    if (t) sp.set("tag", t);
    setOpen(false);
    router.push(`${localePath(locale, "/")}?${sp.toString()}`);
  }

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            <button
              type="button"
              className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
              aria-label="Tutup pencarian"
              onClick={close}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-10 w-full max-w-lg animate-fade-up rounded-2xl bg-white p-5 shadow-card-hover ring-1 ring-black/[0.08] sm:p-6"
            >
              <div className="space-y-1">
                <h2
                  id={titleId}
                  className="font-display text-xl font-semibold tracking-tight text-ink"
                >
                  Cari prompt
                </h2>
                <p className="text-sm text-ink-muted">
                  Jelaskan apa yang ingin kamu buat — kami cocokkan dengan prompt
                  yang relevan.
                </p>
              </div>

              <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">
                    Konteks atau tujuan
                  </span>
                  <textarea
                    ref={textareaRef}
                    name="q"
                    rows={3}
                    required
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Contoh: landing page SaaS B2B, debug API Postgres…"
                    className="field-control w-full rounded-xl bg-soft px-4 py-3 text-sm outline-none transition focus:bg-white text-ink"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-ink">
                    Tag{" "}
                    <span className="font-normal text-ink-faint">(opsional)</span>
                  </span>
                  <input
                    name="tag"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="saas, postgres, copywriting…"
                    className="field-control w-full rounded-xl bg-soft px-4 py-2.5 text-sm outline-none transition focus:bg-white text-ink"
                  />
                </label>

                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={close}
                    className="rounded-full px-4 py-2.5 text-sm font-medium text-ink-muted transition hover:bg-soft hover:text-ink"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
                  >
                    Cari prompt
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={
          variant === "bar"
            ? "flex w-full min-w-0 items-center gap-2 rounded-full bg-soft px-3 py-2 text-left text-sm text-ink-muted transition hover:bg-soft sm:gap-2.5 sm:px-3.5 sm:py-2.5"
            : "inline-flex items-center gap-1.5 rounded-full bg-soft px-2.5 py-1.5 text-sm font-medium text-ink-muted transition hover:bg-soft sm:px-3"
        }
      >
        <SearchIcon className="shrink-0 text-ink-faint" />
        {variant === "bar" ? (
          <span className="min-w-0 truncate">
            <span className="sm:hidden">Cari prompt…</span>
            <span className="hidden sm:inline">
              Cari prompt, konteks, atau ide…
            </span>
          </span>
        ) : (
          <>
            <span className="hidden sm:inline">Cari</span>
            <span className="sr-only sm:hidden">Cari</span>
          </>
        )}
      </button>
      {modal}
    </>
  );
}
