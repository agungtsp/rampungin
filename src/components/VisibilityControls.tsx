"use client";

import { useMemo, useState } from "react";
import type { VisibilityIntent } from "@/lib/types";

const PRESETS = [
  { label: "Selamanya", hours: null as number | null },
  { label: "1 jam", hours: 1 },
  { label: "6 jam", hours: 6 },
  { label: "24 jam", hours: 24 },
  { label: "72 jam", hours: 72 },
  { label: "7 hari", hours: 168 },
] as const;

type Props = {
  value: VisibilityIntent;
  onChange: (intent: VisibilityIntent) => void;
};

export function VisibilityControls({ value, onChange }: Props) {
  const [customHours, setCustomHours] = useState("12");
  const mode = value.kind === "private" ? "private" : "public";

  const activePreset = useMemo(() => {
    if (value.kind !== "timed") return value.kind === "public" ? "Selamanya" : null;
    const match = PRESETS.find((p) => p.hours === value.hours);
    return match?.label ?? "custom";
  }, [value]);

  return (
    <div className="space-y-3 rounded-xl border border-primary/10 bg-soft/40 p-4">
      <p className="text-sm font-semibold text-ink">Visibilitas</p>
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
          Publik
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
          Privat
        </button>
      </div>

      {mode === "public" && (
        <div className="space-y-2">
          <p className="text-xs text-ink-muted">Publik selama</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={`rounded-full px-3 py-1 text-xs ${
                  activePreset === p.label
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
              Pakai jam custom
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
