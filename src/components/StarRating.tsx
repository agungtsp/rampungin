"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { createClient } from "@/lib/supabase/client";

type Props = {
  promptId: string;
  promptPath: string;
  initialAvg: number;
  initialCount: number;
  initialUserStars: number | null;
  isLoggedIn: boolean;
  canRate: boolean;
};

function Star({
  filled,
  onClick,
  disabled,
  label,
}: {
  filled: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="p-0.5 text-amber-400 transition hover:scale-110 disabled:cursor-default disabled:opacity-60"
      aria-label={label}
      title={label}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />
      </svg>
    </button>
  );
}

export function StarRating({
  promptId,
  promptPath,
  initialAvg,
  initialCount,
  initialUserStars,
  isLoggedIn,
  canRate,
}: Props) {
  const { locale } = useLocale();
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState<number | null>(initialUserStars);
  const [hover, setHover] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const display = hover ?? mine ?? 0;

  async function rate(stars: number) {
    if (!canRate) return;
    if (!isLoggedIn) {
      const next = encodeURIComponent(
        promptPath.startsWith("/id") || promptPath.startsWith("/en")
          ? promptPath
          : localePath(locale, promptPath),
      );
      window.location.href = `${localePath(locale, "/auth")}?next=${next}`;
      return;
    }
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("upsert_prompt_rating", {
      p_id: promptId,
      p_stars: stars,
    });
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    const prev = mine;
    setMine(stars);
    if (prev == null) {
      const nextCount = count + 1;
      const nextAvg = (avg * count + stars) / nextCount;
      setCount(nextCount);
      setAvg(Math.round(nextAvg * 100) / 100);
    } else {
      const nextAvg = (avg * count - prev + stars) / count;
      setAvg(Math.round(nextAvg * 100) / 100);
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="flex items-center"
          onMouseLeave={() => setHover(null)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} onMouseEnter={() => canRate && setHover(n)}>
              <Star
                filled={n <= display}
                disabled={busy || !canRate}
                onClick={() => void rate(n)}
                label={
                  locale === "en"
                    ? `Rate ${n} star${n > 1 ? "s" : ""}`
                    : `Beri ${n} bintang`
                }
              />
            </span>
          ))}
        </div>
        <span className="text-sm text-ink-muted">
          {count > 0
            ? `${avg.toFixed(1)} · ${count} ${
                locale === "en"
                  ? count === 1
                    ? "rating"
                    : "ratings"
                  : "penilaian"
              }`
            : locale === "en"
              ? "No ratings yet"
              : "Belum ada penilaian"}
        </span>
      </div>
      {msg ? <p className="text-xs text-red-600">{msg}</p> : null}
    </div>
  );
}
