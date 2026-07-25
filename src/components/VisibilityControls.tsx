"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n";
import type { VisibilityIntent } from "@/lib/types";

type Props = {
  value: VisibilityIntent;
  onChange: (intent: VisibilityIntent) => void;
};

export function VisibilityControls({ value, onChange }: Props) {
  const { t } = useLocale();
  const [customHours, setCustomHours] = useState("12");
  const mode = value.kind === "private" ? "private" : "public";

  const presets = useMemo(
    () =>
      [
        { key: "forever", label: t("visibilityForever"), hours: null as number | null },
        { key: "1h", label: t("visibility1h"), hours: 1 },
        { key: "6h", label: t("visibility6h"), hours: 6 },
        { key: "24h", label: t("visibility24h"), hours: 24 },
        { key: "72h", label: t("visibility72h"), hours: 72 },
        { key: "7d", label: t("visibility7d"), hours: 168 },
      ] as const,
    [t],
  );

  const activePreset = useMemo(() => {
    if (value.kind !== "timed") {
      return value.kind === "public" ? "forever" : null;
    }
    const match = presets.find((p) => p.hours === value.hours);
    return match?.key ?? "custom";
  }, [value, presets]);

  return (
    <div className="space-y-3 rounded-xl border border-primary/10 bg-soft/40 p-4">
      <p className="text-sm font-semibold text-ink">{t("visibilityTitle")}</p>
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${
            mode === "public"
              ? "bg-primary-hover text-white"
              : "bg-white text-ink border"
          }`}
          onClick={() => onChange({ kind: "public" })}
        >
          {t("visibilityPublic")}
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${
            mode === "private"
              ? "bg-primary-hover text-white"
              : "bg-white text-ink border"
          }`}
          onClick={() => onChange({ kind: "private" })}
        >
          {t("visibilityPrivate")}
        </button>
      </div>

      {mode === "public" && (
        <div className="space-y-2">
          <p className="text-xs text-ink-muted">{t("visibilityPublicFor")}</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`rounded-full px-3 py-1 text-xs ${
                  activePreset === p.key
                    ? "bg-primary-hover text-white"
                    : "bg-white border text-ink"
                }`}
                onClick={() =>
                  onChange(
                    p.hours == null
                      ? { kind: "public" }
                      : { kind: "timed", hours: p.hours },
                  )
                }
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              className="field-control w-24 rounded-lg px-2 py-1 text-sm"
            />
            <button
              type="button"
              className="field-control rounded-lg bg-white px-3 py-1 text-sm text-ink"
              onClick={() => {
                const hours = Number(customHours);
                if (!Number.isFinite(hours) || hours <= 0) return;
                onChange({ kind: "timed", hours });
              }}
            >
              {t("visibilityCustom")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
