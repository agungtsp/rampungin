"use client";

import { useCallback, useMemo, useState } from "react";
import { DonateModal } from "@/components/DonateModal";
import { chatgptPromptUrl, geminiPromptUrl } from "@/lib/ai-shortcuts";
import { parseAiPlatform, type AiPlatform } from "@/lib/ai-platform";
import {
  trackCopyPrompt,
  trackGeneratePrompt,
  trackOpenAiShortcut,
} from "@/lib/analytics";
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
  const { locale, t } = useLocale();
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

  function maybeOpenDonate() {
    try {
      if (sessionStorage.getItem("rampungin_donate_seen") === "1") return;
      sessionStorage.setItem("rampungin_donate_seen", "1");
      setDonateOpen(true);
    } catch {
      setDonateOpen(true);
    }
  }

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
    setError(
      `${t("formRequiredPrefix")}: ${missing.map((m) => m.label).join(", ")}`,
    );
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
    maybeOpenDonate();
    trackGeneratePrompt(promptId, mode);
    await trackGenerate();
  }

  async function copy() {
    if (!hasGenerated || !output.trim()) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    trackCopyPrompt(promptId, mode);
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
                    <option value="">{t("formSelectPlaceholder")}</option>
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
                    {t("formRequired")}
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
          title="Generate Prompt"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Generate Prompt
        </button>
        <span className="text-xs text-ink-faint">
          {generateCount}{" "}
          {locale === "en" ? "generations" : "kali dihasilkan"}
        </span>
      </div>

      {hasGenerated && output ? (
        <div className="space-y-3">
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl bg-stage p-4 font-mono text-sm leading-relaxed text-white/90">
            {output}
          </pre>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void copy()}
              title={
                locale === "en" ? "Copy to clipboard" : "Salin ke clipboard"
              }
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {copied
                ? locale === "en"
                  ? "Copied"
                  : "Tersalin"
                : locale === "en"
                  ? "Copy"
                  : "Salin"}
            </button>
            {(platform === "all" || platform === "chatgpt") && (
              <a
                href={chatgptPromptUrl(output)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOpenAiShortcut("chatgpt", promptId)}
                className="rounded-xl border border-secondary bg-panel px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-soft"
                title={t("openChatGpt")}
                aria-label={t("openChatGpt")}
              >
                {t("openChatGpt")}
              </a>
            )}
            {(platform === "all" || platform === "gemini") && (
              <a
                href={geminiPromptUrl(output)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackOpenAiShortcut("gemini", promptId)}
                className="rounded-xl border border-secondary bg-panel px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-soft"
                title={t("openAiStudio")}
                aria-label={t("openAiStudio")}
              >
                {t("openAiStudio")}
              </a>
            )}
          </div>
        </div>
      ) : null}

      <DonateModal open={donateOpen} onClose={closeDonate} />
    </div>
  );
}
