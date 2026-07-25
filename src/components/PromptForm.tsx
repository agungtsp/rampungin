"use client";

import { useCallback, useMemo, useState } from "react";
import { DonateModal } from "@/components/DonateModal";
import { chatgptPromptUrl, geminiPromptUrl } from "@/lib/ai-shortcuts";
import { parseAiPlatform, type AiPlatform } from "@/lib/ai-platform";
import { useLocale } from "@/lib/i18n";
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
  aiPlatform?: AiPlatform | string | null;
};

const baseInputClass =
  "field-control w-full rounded-xl px-3 py-2.5 text-sm outline-none transition";

const okInputClass =
  "bg-white text-ink";

const errInputClass =
  "field-control-error bg-rose-100 text-rose-950 placeholder:text-rose-400/80";

export function PromptForm({
  promptId,
  mode,
  body,
  fields,
  isPublic,
  publicUntil,
  initialGenerateCount = 0,
  aiPlatform = "all",
}: Props) {
  const { locale } = useLocale();
  const platform = parseAiPlatform(aiPlatform);
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidKeys, setInvalidKeys] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [generateCount, setGenerateCount] = useState(initialGenerateCount);

  const closeDonate = useCallback(() => setDonateOpen(false), []);

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
    let next = "";
    if (mode === "template") {
      const missing = getMissingRequiredFields(fields, values);
      if (missing.length) {
        applyMissing(missing);
        setOutput("");
        setHasGenerated(false);
        return;
      }
      next = interpolateTemplate(body, values);
    } else {
      next = body;
    }
    setOutput(next);
    setError(null);
    setInvalidKeys([]);
    setHasGenerated(true);
    setDonateOpen(true);
    await trackGenerate();
  }

  async function copy() {
    if (!hasGenerated || !output.trim()) return;
    await navigator.clipboard.writeText(output);
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
        <div className="space-y-4 rounded-2xl bg-white p-5 ring-1 ring-ink/20">
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
                <label
                  className={`block text-sm font-medium ${
                    invalid ? "text-rose-800" : "text-ink"
                  }`}
                >
                  {f.label}
                  {f.required ? <span className="text-rose-600"> *</span> : ""}
                </label>
                {f.field_type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={values[f.field_key] ?? ""}
                    placeholder={f.placeholder ?? undefined}
                    onChange={(e) => setValue(f.field_key, e.target.value)}
                    className={fieldInputClass(f.field_key)}
                  />
                ) : f.field_type === "radio" ? (
                  <div className="flex flex-wrap gap-2">
                    {(f.options ?? []).map((opt) => {
                      const selected = values[f.field_key] === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setValue(f.field_key, opt)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            selected
                              ? "bg-primary text-white"
                              : invalid
                                ? "bg-white text-rose-900 ring-1 ring-rose-300"
                                : "bg-soft text-ink ring-1 ring-ink/20 hover:ring-ink/35"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : f.field_type === "checkbox" ? (
                  <div className="flex flex-wrap gap-2">
                    {(f.options ?? []).map((opt) => {
                      const selected = isChecked(f.field_key, opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() =>
                            toggleCheckbox(f.field_key, opt, !selected)
                          }
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                            selected
                              ? "bg-primary text-white"
                              : invalid
                                ? "bg-white text-rose-900 ring-1 ring-rose-300"
                                : "bg-soft text-ink ring-1 ring-ink/20 hover:ring-ink/35"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                ) : f.field_type === "select" ? (
                  <select
                    value={values[f.field_key] ?? ""}
                    onChange={(e) => setValue(f.field_key, e.target.value)}
                    className={fieldInputClass(f.field_key)}
                  >
                    <option value="">Pilih…</option>
                    {(f.options ?? []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={values[f.field_key] ?? ""}
                    placeholder={f.placeholder ?? undefined}
                    onChange={(e) => setValue(f.field_key, e.target.value)}
                    className={fieldInputClass(f.field_key)}
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
        <button
          type="button"
          onClick={() => void generate()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
        >
          Hasilkan prompt
        </button>
        {hasGenerated ? (
          <button
            type="button"
            onClick={() => void copy()}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-ink ring-1 ring-black/[0.1] transition hover:bg-soft"
          >
            {copied ? "Tersalin" : "Salin"}
          </button>
        ) : null}
        <span className="text-xs text-ink-faint">
          {generateCount} kali dihasilkan
        </span>
      </div>

      {hasGenerated && output ? (
        <div className="space-y-3">
          <pre className="whitespace-pre-wrap rounded-2xl bg-white p-4 text-sm leading-relaxed text-ink ring-1 ring-ink/20">
            {output}
          </pre>
          <div className="flex flex-wrap gap-2">
            {(platform === "all" || platform === "chatgpt") && (
              <a
                href={chatgptPromptUrl(output)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-soft px-4 py-2 text-sm font-semibold text-ink ring-1 ring-secondary/50 transition hover:bg-secondary/30"
              >
                {locale === "en" ? "Open in ChatGPT ↗" : "Buka di ChatGPT ↗"}
              </a>
            )}
            {(platform === "all" || platform === "gemini") && (
              <a
                href={geminiPromptUrl(output)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-soft px-4 py-2 text-sm font-semibold text-ink ring-1 ring-secondary/50 transition hover:bg-secondary/30"
              >
                {locale === "en" ? "Open in AI Studio ↗" : "Buka di AI Studio ↗"}
              </a>
            )}
          </div>
          <p className="text-xs text-ink-faint">
            {locale === "en" ? (
              <>
                ChatGPT uses <code className="rounded bg-soft px-1">q</code>; AI
                Studio uses <code className="rounded bg-soft px-1">prompt</code>{" "}
                so the text is prefilled in a new tab.
              </>
            ) : (
              <>
                ChatGPT memakai <code className="rounded bg-soft px-1">q</code>;
                AI Studio memakai{" "}
                <code className="rounded bg-soft px-1">prompt</code> agar teks
                langsung terisi di tab baru.
              </>
            )}
          </p>
        </div>
      ) : null}

      <DonateModal open={donateOpen} onClose={closeDonate} />
    </div>
  );
}
