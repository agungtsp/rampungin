"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { useLocale } from "@/lib/i18n";

type Props = {
  promptId: string;
  isPublic: boolean;
  initialPinned: boolean;
};

/** Compact owner pin toggle for my-prompts cards. */
export function OwnerPinButton({
  promptId,
  isPublic,
  initialPinned,
}: Props) {
  const { t } = useLocale();
  const router = useRouter();
  const [pinned, setPinned] = useState(initialPinned);
  const [busy, setBusy] = useState(false);

  async function toggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy || (!pinned && !isPublic)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/prompts/${promptId}/owner-pin`, {
        method: pinned ? "DELETE" : "POST",
      });
      if (!res.ok) return;
      setPinned(!pinned);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy || (!pinned && !isPublic)}
      onClick={(e) => void toggle(e)}
      title={
        !isPublic && !pinned
          ? t("ownerPinPublicOnly")
          : pinned
            ? t("ownerUnpin")
            : t("ownerPin")
      }
      aria-label={pinned ? t("ownerUnpin") : t("ownerPin")}
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm transition ${
        pinned
          ? "bg-primary text-white"
          : "bg-white/95 text-ink ring-1 ring-ink/15 hover:bg-soft"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {pinned ? "★ Pin" : "☆ Pin"}
    </button>
  );
}
