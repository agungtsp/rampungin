"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n";
import { shortLinkPath } from "@/lib/short-slug";

type Props = {
  promptId: string;
  isPublic: boolean;
  isOwner: boolean;
  initialSlug: string | null;
};

export function ShortLinkControls({
  promptId,
  isPublic,
  isOwner,
  initialSlug,
}: Props) {
  const { locale, t } = useLocale();
  const [slug, setSlug] = useState(initialSlug);
  const [custom, setCustom] = useState(initialSlug ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Public visitors only see an existing short link to copy.
  if (!isOwner && !slug) return null;

  async function createOrUpdate(useCustom: boolean) {
    if (!isOwner || busy) return;
    if (!isPublic) {
      setError(t("shortLinkPublicOnly"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}/short-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          useCustom && custom.trim() ? { slug: custom } : {},
        ),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        short_slug?: string;
      };
      if (!res.ok) {
        setError(data.error || t("shortLinkFailed"));
        return;
      }
      if (data.short_slug) {
        setSlug(data.short_slug);
        setCustom(data.short_slug);
      }
    } catch {
      setError(t("shortLinkFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!slug) return;
    const url = `${window.location.origin}${shortLinkPath(slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError(t("shortLinkFailed"));
    }
  }

  async function clearLink() {
    if (!isOwner || busy || !slug) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${promptId}/short-link`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setError(t("shortLinkFailed"));
        return;
      }
      setSlug(null);
      setCustom("");
    } catch {
      setError(t("shortLinkFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-ink/15">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{t("shortLinkTitle")}</p>
        <p className="text-xs text-ink-muted">
          {isOwner ? t("shortLinkHint") : t("shortLinkPublicHint")}
        </p>
      </div>

      {slug ? (
        <div className="flex flex-wrap items-center gap-2">
          <code className="rounded-lg bg-soft px-2.5 py-1.5 text-xs text-ink">
            {shortLinkPath(slug)}
          </code>
          <button
            type="button"
            disabled={busy}
            onClick={() => void copyLink()}
            className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {copied ? t("shortLinkCopied") : t("shortLinkCopy")}
          </button>
          {isOwner ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void clearLink()}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-ink ring-1 ring-secondary/50 hover:bg-soft disabled:opacity-50"
            >
              {t("shortLinkClear")}
            </button>
          ) : null}
        </div>
      ) : null}

      {isOwner ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="min-w-[12rem] flex-1 space-y-1 text-xs text-ink-muted">
            <span>{t("shortLinkCustom")}</span>
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={locale === "en" ? "my-prompt" : "prompt-saya"}
              disabled={busy || !isPublic}
              className="w-full rounded-xl border-0 bg-soft px-3 py-2 text-sm text-ink ring-1 ring-secondary/50 placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
            />
          </label>
          <button
            type="button"
            disabled={busy || !isPublic}
            onClick={() => void createOrUpdate(Boolean(custom.trim()))}
            title={
              !isPublic ? t("shortLinkPublicOnly") : t("shortLinkGenerate")
            }
            className="rounded-full bg-soft px-4 py-2 text-sm font-semibold text-ink ring-1 ring-secondary/50 hover:bg-secondary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {slug
              ? custom.trim() && custom.trim() !== slug
                ? t("shortLinkUpdate")
                : t("shortLinkGenerate")
              : custom.trim()
                ? t("shortLinkSetCustom")
                : t("shortLinkGenerate")}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
