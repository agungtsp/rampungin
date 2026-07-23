"use client";

import { useMemo, useState } from "react";
import {
  getMissingRequiredFields,
  interpolateTemplate,
} from "@/lib/interpolate";
import { isEffectivelyPublic } from "@/lib/visibility";

import type { FieldType } from "@/lib/types";

export type FieldRow = {
  field_key: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options?: string[] | null;
  placeholder?: string | null;
};

type Props = {
  promptId: string;
  mode: "template" | "static";
  body: string;
  fields: FieldRow[];
  isPublic: boolean;
  publicUntil: string | null;
  initialGenerateCount?: number;
};

const baseInputClass =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 transition focus:ring-2";

const okInputClass =
  "bg-white ring-black/[0.08] focus:ring-primary/30";

const errInputClass =
  "bg-rose-100 ring-rose-400 text-rose-950 placeholder:text-rose-400/80 focus:ring-rose-400/50";

export function PromptForm({
  promptId,
  mode,
  body,
  fields,
  isPublic,
  publicUntil,
  initialGenerateCount = 0,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState(mode === "static" ? body : "");
  const [error, setError] = useState<string | null>(null);
  const [invalidKeys, setInvalidKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [generateCount, setGenerateCount] = useState(initialGenerateCount);

  function setValue(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (value.trim()) {
      setInvalidKeys((keys) => keys.filter((k) => k !== key));
    }
  }

  function toggleCheckbox(key: string, option: string, checked: boolean) {
    setValues((v) => {
      const current = (v[key] ?? "")
        .split(", ")
        .map((s) => s.trim())
        .filter(Boolean);
      const next = checked
        ? [...current.filter((o) => o !== option), option]
        : current.filter((o) => o !== option);
      const joined = next.join(", ");
      if (joined.trim()) {
        setInvalidKeys((keys) => keys.filter((k) => k !== key));
      }
      return { ...v, [key]: joined };
    });
  }

  function isChecked(key: string, option: string) {
    return (values[key] ?? "")
      .split(", ")
      .map((s) => s.trim())
      .includes(option);
  }

  function isInvalid(key: string) {
    return invalidKeys.includes(key);
  }

  const effectivelyPublic = useMemo(
    () => isEffectivelyPublic(isPublic, publicUntil),
    [isPublic, publicUntil],
  );

  async function trackCopy() {
    if (!effectivelyPublic) return;
    await fetch(`/api/prompts/${promptId}/copy`, { method: "POST" });
  }

  async function trackGenerate() {
    if (!effectivelyPublic) return;
    try {
      const res = await fetch(`/api/prompts/${promptId}/generate`, {
        method: "POST",
      });
      if (res.ok) setGenerateCount((n) => n + 1);
    } catch {
      // non-blocking
    }
  }

  function applyMissing(missing: { key: string; label: string }[]) {
    setInvalidKeys(missing.map((m) => m.key));
    setError(`Lengkapi field wajib: ${missing.map((m) => m.label).join(", ")}`);
  }

  async function generate() {
    if (mode === "static") {
      setOutput(body);
      setError(null);
      setInvalidKeys([]);
      await trackGenerate();
      return;
    }
    const missing = getMissingRequiredFields(fields, values);
    if (missing.length) {
      applyMissing(missing);
      setOutput("");
      return;
    }
    setError(null);
    setInvalidKeys([]);
    setOutput(interpolateTemplate(body, values));
    await trackGenerate();
  }

  async function copy() {
    const missing =
      mode === "template" ? getMissingRequiredFields(fields, values) : [];
    if (missing.length) {
      applyMissing(missing);
      return;
    }

    const text =
      mode === "template" ? interpolateTemplate(body, values) : body;
    const wasEmpty = !output.trim();
    setOutput(text);
    setError(null);
    setInvalidKeys([]);
    if (wasEmpty) {
      await trackGenerate();
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    await trackCopy();
  }

  function fieldInputClass(key: string) {
    return `${baseInputClass} ${isInvalid(key) ? errInputClass : okInputClass}`;
  }

  return (
    <div className="space-y-5">
      {mode === "template" && fields.length > 0 && (
        <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-black/[0.07]">
          {fields.map((f) => {
            const invalid = isInvalid(f.field_key);
            return (
              <div
                key={f.field_key}
                className={`space-y-1.5 rounded-xl transition ${
                  invalid &&
                  (f.field_type === "radio" || f.field_type === "checkbox")
                    ? "bg-rose-100 p-3 ring-1 ring-rose-300"
                    : ""
                }`}
              >
                <span
                  className={`block text-sm font-medium ${
                    invalid ? "text-rose-800" : "text-ink"
                  }`}
                >
                  {f.label}
                  {f.required ? <span className="text-rose-600"> *</span> : ""}
                </span>
                {f.field_type === "textarea" ? (
                  <textarea
                    className={fieldInputClass(f.field_key)}
                    rows={3}
                    placeholder={f.placeholder ?? ""}
                    value={values[f.field_key] ?? ""}
                    aria-invalid={invalid}
                    onChange={(e) => setValue(f.field_key, e.target.value)}
                  />
                ) : f.field_type === "select" ? (
                  <select
                    className={fieldInputClass(f.field_key)}
                    value={values[f.field_key] ?? ""}
                    aria-invalid={invalid}
                    onChange={(e) => setValue(f.field_key, e.target.value)}
                  >
                    <option value="">Pilih…</option>
                    {(f.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : f.field_type === "radio" ? (
                  <div className="flex flex-wrap gap-2">
                    {(f.options ?? []).map((opt) => {
                      const active = (values[f.field_key] ?? "") === opt;
                      return (
                        <label
                          key={opt}
                          className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
                            active
                              ? "bg-primary text-white"
                              : invalid
                                ? "bg-white text-rose-900 ring-1 ring-rose-300"
                                : "bg-soft text-ink ring-1 ring-black/[0.08] hover:ring-black/[0.14]"
                          }`}
                        >
                          <input
                            type="radio"
                            className="sr-only"
                            name={f.field_key}
                            checked={active}
                            onChange={() => setValue(f.field_key, opt)}
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ) : f.field_type === "checkbox" ? (
                  <div className="flex flex-wrap gap-2">
                    {(f.options ?? []).map((opt) => {
                      const active = isChecked(f.field_key, opt);
                      return (
                        <label
                          key={opt}
                          className={`flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
                            active
                              ? "bg-primary text-white"
                              : invalid
                                ? "bg-white text-rose-900 ring-1 ring-rose-300"
                                : "bg-soft text-ink ring-1 ring-black/[0.08] hover:ring-black/[0.14]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={active}
                            onChange={(e) =>
                              toggleCheckbox(
                                f.field_key,
                                opt,
                                e.target.checked,
                              )
                            }
                          />
                          {active ? "✓ " : ""}
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    className={fieldInputClass(f.field_key)}
                    placeholder={f.placeholder ?? ""}
                    value={values[f.field_key] ?? ""}
                    aria-invalid={invalid}
                    onChange={(e) => setValue(f.field_key, e.target.value)}
                  />
                )}
                {invalid ? (
                  <p className="text-xs font-medium text-rose-700">
                    Wajib diisi
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {mode === "template" && (
          <button
            type="button"
            onClick={() => void generate()}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
          >
            Hasilkan prompt
          </button>
        )}
        <button
          type="button"
          onClick={() => void copy()}
          className="rounded-full px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-black/[0.1] transition hover:bg-white"
        >
          {copied ? "Tersalin!" : "Salin"}
        </button>
        <span className="text-xs text-ink-faint">
          {generateCount} kali digenerate
        </span>
      </div>

      {output && (
        <pre className="whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-relaxed text-ink ring-1 ring-black/[0.07]">
          {output}
        </pre>
      )}
    </div>
  );
}
