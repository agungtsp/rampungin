"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categoryLabel } from "@/lib/categories";
import { useLocale } from "@/lib/i18n";

type Props = {
  promptId: string;
  category: string | null;
  isOwner: boolean;
  isAdmin: boolean;
  isPublic: boolean;
  initialOwnerPinned: boolean;
  initialAdminPinGlobal: boolean;
  initialAdminPinCategory: boolean;
};

export function PromptPinControls({
  promptId,
  category,
  isOwner,
  isAdmin,
  isPublic,
  initialOwnerPinned,
  initialAdminPinGlobal,
  initialAdminPinCategory,
}: Props) {
  const { locale, t } = useLocale();
  const router = useRouter();
  const [ownerPinned, setOwnerPinned] = useState(initialOwnerPinned);
  const [adminGlobal, setAdminGlobal] = useState(initialAdminPinGlobal);
  const [adminCategory, setAdminCategory] = useState(initialAdminPinCategory);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner && !isAdmin) return null;

  async function toggleOwner() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}/owner-pin`, {
        method: ownerPinned ? "DELETE" : "POST",
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };
      if (!res.ok) {
        if (data.code === "OWNER_PIN_LIMIT") {
          setError(t("ownerPinLimit"));
        } else {
          setError(data.error || t("pinFailed"));
        }
        return;
      }
      setOwnerPinned(!ownerPinned);
      router.refresh();
    } catch {
      setError(t("pinFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleAdmin(scope: "global" | "category", next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/pins/${promptId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, pinned: next }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        admin_pin_global?: boolean;
        admin_pin_category?: boolean;
      };
      if (!res.ok) {
        setError(data.error || t("pinFailed"));
        return;
      }
      if (typeof data.admin_pin_global === "boolean") {
        setAdminGlobal(data.admin_pin_global);
      } else if (scope === "global") {
        setAdminGlobal(next);
      }
      if (typeof data.admin_pin_category === "boolean") {
        setAdminCategory(data.admin_pin_category);
      } else if (scope === "category") {
        setAdminCategory(next);
      }
      router.refresh();
    } catch {
      setError(t("pinFailed"));
    } finally {
      setBusy(false);
    }
  }

  const catLabel = categoryLabel(category, locale);

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-ink/15">
      <p className="text-sm font-semibold text-ink">{t("pinControlsTitle")}</p>
      <div className="flex flex-wrap gap-2">
        {isOwner ? (
          <button
            type="button"
            disabled={busy || (!ownerPinned && !isPublic)}
            onClick={() => void toggleOwner()}
            title={
              !isPublic && !ownerPinned
                ? t("ownerPinPublicOnly")
                : ownerPinned
                  ? t("ownerUnpin")
                  : t("ownerPin")
            }
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              ownerPinned
                ? "bg-primary text-white hover:bg-primary-hover"
                : "bg-soft text-ink ring-1 ring-secondary/50 hover:bg-secondary/30"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {ownerPinned ? t("ownerUnpin") : t("ownerPin")}
          </button>
        ) : null}
        {isAdmin ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => void toggleAdmin("global", !adminGlobal)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                adminGlobal
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "bg-soft text-ink ring-1 ring-secondary/50 hover:bg-secondary/30"
              } disabled:opacity-50`}
            >
              {adminGlobal ? t("adminUnpinHome") : t("adminPinHome")}
            </button>
            <button
              type="button"
              disabled={busy || !category}
              onClick={() => void toggleAdmin("category", !adminCategory)}
              title={!category ? t("adminPinNoCategory") : undefined}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                adminCategory
                  ? "bg-primary text-white hover:bg-primary-hover"
                  : "bg-soft text-ink ring-1 ring-secondary/50 hover:bg-secondary/30"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {adminCategory
                ? t("adminUnpinCategory")
                : `${t("adminPinCategory")} (${catLabel})`}
            </button>
          </>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
