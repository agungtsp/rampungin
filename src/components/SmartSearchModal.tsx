"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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
    router.push(`/?${sp.toString()}`);
  }

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
            ? "flex w-full min-w-0 items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-left text-sm text-zinc-500 transition hover:bg-zinc-200/80 sm:gap-2.5 sm:px-3.5 sm:py-2.5"
            : "inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-200 sm:px-3"
        }
      >
        <SearchIcon className="shrink-0 text-zinc-400" />
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

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-zinc-950/50 backdrop-blur-[2px]"
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
                className="font-display text-xl font-semibold tracking-tight text-zinc-900"
              >
                Cari prompt
              </h2>
              <p className="text-sm text-zinc-500">
                Jelaskan apa yang ingin kamu buat — kami cocokkan ke prompt
                relevan.
              </p>
            </div>

            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-900">
                  Konteks / tujuan
                </span>
                <textarea
                  ref={textareaRef}
                  name="q"
                  rows={3}
                  required
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Contoh: landing page SaaS B2B, debug API Postgres…"
                  className="w-full rounded-xl bg-zinc-50 px-4 py-3 text-sm outline-none ring-1 ring-zinc-200 transition focus:bg-white focus:ring-2 focus:ring-accent/35"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-zinc-900">
                  Tag{" "}
                  <span className="font-normal text-zinc-400">(opsional)</span>
                </span>
                <input
                  name="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="saas, postgres, copywriting…"
                  className="w-full rounded-xl bg-zinc-50 px-4 py-2.5 text-sm outline-none ring-1 ring-zinc-200 transition focus:bg-white focus:ring-2 focus:ring-accent/35"
                />
              </label>

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full px-4 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-ink"
                >
                  Cari prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
