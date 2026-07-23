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
    <div className="space-y-3 rounded-xl border border-blue-900/10 bg-blue-50/40 p-4">
      <p className="text-sm font-semibold text-blue-950">Visibilitas</p>
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${
            mode === "public"
              ? "bg-blue-800 text-white"
              : "bg-white text-blue-900 border"
          }`}
          onClick={() => onChange({ kind: "public" })}
        >
          Publik
        </button>
        <button
          type="button"
          className={`rounded-lg px-3 py-2 text-sm ${
            mode === "private"
              ? "bg-blue-800 text-white"
              : "bg-white text-blue-900 border"
          }`}
          onClick={() => onChange({ kind: "private" })}
        >
          Privat
        </button>
      </div>

      {mode === "public" && (
        <div className="space-y-2">
          <p className="text-xs text-blue-900/70">Publik selama</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={`rounded-full px-3 py-1 text-xs ${
                  activePreset === p.label
                    ? "bg-blue-800 text-white"
                    : "bg-white border text-blue-900"
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
              className="w-24 rounded-lg border px-2 py-1 text-sm"
            />
            <button
              type="button"
              className="rounded-lg bg-white border px-3 py-1 text-sm"
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
