"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  promptId: string;
  promptPath: string;
  title?: string;
  initialLiked: boolean;
  likeCount: number;
  canEngage: boolean;
  isLoggedIn: boolean;
  showShare: boolean;
};

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <path d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.566Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`shrink-0 transition ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.5l-5.1-6.7L5.8 22H2.7l7.3-8.3L1 2h6.7l4.6 6.1L18.9 2zm-1.1 18h1.8L6.3 3.9H4.4L17.8 20z" />
    </svg>
  );
}

function ThreadsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.2 2c3.8 0 6.5 1.6 7.5 4.1.5 1.2.7 2.6.6 4.1v.2c0 .3 0 .5-.1.8-.4 3.1-2.1 5.3-4.8 6.3-.8.3-1.7.5-2.6.5-1.4 0-2.7-.4-3.7-1.1-.4-.3-.5-.8-.3-1.2.2-.4.7-.6 1.1-.4.7.4 1.5.6 2.4.6.6 0 1.2-.1 1.7-.3 1.6-.6 2.6-1.9 2.8-3.7-.6.3-1.3.5-2.1.5-2.9 0-4.8-1.9-4.8-4.7 0-2.9 2.2-4.8 5.1-4.8 2.3 0 3.9 1.1 4.6 2.9.2.4 0 .9-.4 1.1-.4.2-.9 0-1.1-.4-.4-1-1.3-1.6-2.7-1.6-1.8 0-3 1.1-3 2.8 0 1.7 1.1 2.7 2.8 2.7.7 0 1.4-.2 1.9-.5.1-.6.1-1.2.1-1.8V9.8c0-1.2-.1-2.3-.5-3.2C14.4 4.8 12.9 4 11.1 4 7.7 4 5.5 6.5 5.5 10.2c0 3.2 1.8 5.5 4.7 6.5.7.2 1.4.4 2.2.4 1.2 0 2.3-.3 3.3-.8 3.1-1.2 5-3.8 5.4-7.3.1-.4.1-.8.1-1.2.1-1.4-.1-2.7-.6-3.9C19.4 1.3 16.2 0 12.2 0 6.3 0 2 4.2 2 10.2c0 5.5 3.5 9.5 9.2 10.6.6.1 1.2.2 1.8.2 4.8 0 8.7-2.6 9.9-6.7.2-.6.8-.9 1.4-.7.6.2.9.8.7 1.4C23.5 19.8 18.5 23 13 23c-.7 0-1.5-.1-2.2-.2C4.3 21.5 0 16.7 0 10.2 0 3.1 5.1 0 12.2 0z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.7 5.23" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07L13.3 18.77" />
    </svg>
  );
}

function openShareWindow(href: string) {
  window.open(href, "_blank", "noopener,noreferrer,width=640,height=640");
}

const menuItemClass =
  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-soft";

export function SocialBar({
  promptId,
  promptPath,
  title = "Prompt AI di Rampungin",
  initialLiked,
  likeCount,
  canEngage,
  isLoggedIn,
  showShare,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(likeCount);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function toggleLike() {
    if (!isLoggedIn) {
      window.location.href = `/auth?next=${encodeURIComponent(promptPath)}`;
      return;
    }
    if (!canEngage) return;
    const supabase = createClient();
    const { data, error } = await supabase.rpc("toggle_like", { p_id: promptId });
    if (error) {
      setMessage(error.message);
      return;
    }
    setLiked(Boolean(data));
    setLikes((n) => (data ? n + 1 : Math.max(0, n - 1)));
  }

  function flash(msg: string) {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 2800);
  }

  function runAndClose(fn: () => void | Promise<void>) {
    setOpen(false);
    void fn();
  }

  function shareFacebook() {
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
    );
  }

  function shareX() {
    openShareWindow(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`,
    );
  }

  function shareThreads() {
    const text = `${title}\n\n${window.location.href}`;
    openShareWindow(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`,
    );
  }

  async function shareInstagram() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Tautan disalin — tempel di Instagram Stories atau postingan");
    } catch {
      flash("Salin tautan secara manual, lalu buka Instagram");
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flash("Tautan disalin");
    } catch {
      flash("Gagal menyalin tautan");
    }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-black/[0.07]">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleLike}
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition ${
            liked
              ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100"
              : "text-ink ring-1 ring-black/[0.08] hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200"
          }`}
        >
          <HeartIcon filled={liked} />
          <span>
            {liked ? "Disukai" : "Suka"}
            <span className="mx-1 text-current/40">·</span>
            <span className="tabular-nums">{likes}</span>
          </span>
        </button>

        {showShare ? (
          <div className="relative" ref={rootRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls={menuId}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-ink ring-1 ring-black/[0.08] transition hover:bg-soft hover:text-primary-hover hover:ring-secondary/25"
            >
              <ShareIcon />
              Bagikan
              <ChevronIcon open={open} />
            </button>

            {open ? (
              <div
                id={menuId}
                role="menu"
                className="absolute left-0 z-20 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5 shadow-card-hover ring-1 ring-secondary/50"
              >
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => runAndClose(shareFacebook)}
                >
                  <span className="text-[#1877F2]">
                    <FacebookIcon />
                  </span>
                  Facebook
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => runAndClose(shareThreads)}
                >
                  <ThreadsIcon />
                  Threads
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => runAndClose(shareInstagram)}
                >
                  <span className="text-rose-500">
                    <InstagramIcon />
                  </span>
                  Instagram
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => runAndClose(shareX)}
                >
                  <XIcon />
                  X
                </button>
                <div className="my-1 border-t border-secondary/60" />
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  onClick={() => runAndClose(copyLink)}
                >
                  <LinkIcon />
                  Salin tautan
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isLoggedIn && (
          <Link
            href={`/auth?next=${encodeURIComponent(promptPath)}`}
            className="text-sm text-primary hover:underline"
          >
            Masuk untuk menyukai
          </Link>
        )}
      </div>

      {message ? <p className="text-sm text-primary-hover">{message}</p> : null}
    </div>
  );
}
