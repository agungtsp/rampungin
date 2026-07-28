"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { useLocale } from "@/lib/i18n";

type Props = {
  promptId: string;
  promptTitle: string;
};

export function SoftDeleteButton({ promptId, promptTitle }: Props) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

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
    try {
      const res = await fetch(`/api/prompts/${promptId}/soft-delete`, {
        method: "POST",
      });
      if (!res.ok) return;
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={(e) => void onDelete(e)}
      title={t("deletePrompt")}
      aria-label={t("deletePrompt")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-sm ring-1 ring-ink/15 transition hover:bg-rose-50 disabled:opacity-50"
    >
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
    </button>
  );
}
