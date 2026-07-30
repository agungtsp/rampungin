"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { useLocale } from "@/lib/i18n";

type Props = {
  promptId: string;
  promptTitle: string;
  /** When set, navigate here after successful delete (e.g. leave detail page). */
  redirectTo?: string | null;
  compact?: boolean;
};

export function SoftDeleteButton({
  promptId,
  promptTitle,
  redirectTo = null,
  compact = true,
}: Props) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;

    const message =
      locale === "en"
        ? `Delete “${promptTitle}”? It will be hidden and short links will stop working.`
        : `Hapus “${promptTitle}”? Prompt akan disembunyikan dan short link berhenti berfungsi.`;
    if (!window.confirm(message)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}/soft-delete`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error || t("deletePromptFailed"));
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <span className="inline-flex flex-col items-end gap-0.5">
        <button
          type="button"
          disabled={busy}
          onClick={(e) => void onDelete(e)}
          title={t("deletePrompt")}
          aria-label={t("deletePrompt")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-sm ring-1 ring-ink/15 transition hover:bg-rose-50 disabled:opacity-50"
        >
          <TrashIcon />
        </button>
        {error ? (
          <span className="max-w-[9rem] text-right text-[10px] text-rose-600">
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={busy}
        onClick={(e) => void onDelete(e)}
        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
      >
        <TrashIcon />
        {busy ? t("deletingPrompt") : t("deletePrompt")}
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.5 3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V4H16a1 1 0 1 1 0 2h-.292l-.7 9.1A2 2 0 0 1 13.017 17H6.983a2 2 0 0 1-1.991-1.9L4.292 6H4a1 1 0 0 1 0-2h3.5V3Zm1.5 1h2V3.5h-2V4Zm-2.2 2 .66 8.58a.5.5 0 0 0 .498.42h6.084a.5.5 0 0 0 .498-.42L13.2 6H6.8Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
