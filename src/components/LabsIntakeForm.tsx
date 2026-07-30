"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { LabsIntakeCopy } from "@/lib/labs-content";
import type { Locale } from "@/lib/i18n/locale";
import { useLocale } from "@/lib/i18n";
import { isValidPhone } from "@/lib/labs-phone";
import {
  LABS_AUDIENCES,
  LABS_EXPECTATIONS,
  LABS_TIME_SPENT,
} from "@/lib/labs";

const baseInputClass =
  "mt-1.5 w-full rounded-xl border bg-panel px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-faint focus:ring-2";
const okInputClass = "border-secondary ring-primary/30";
const errInputClass = "border-rose-400 ring-1 ring-rose-300 focus:ring-rose-400";

type FieldKey =
  | "name"
  | "email"
  | "phone"
  | "audience"
  | "problem"
  | "repeating"
  | "timeSpent"
  | "expectations";

export function LabsIntakeForm({
  locale,
  copy,
}: {
  locale: Locale;
  copy: LabsIntakeCopy;
}) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [audience, setAudience] = useState("");
  const [problem, setProblem] = useState("");
  const [repeatingTasks, setRepeatingTasks] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [expectations, setExpectations] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState("");
  const [invalidKeys, setInvalidKeys] = useState<FieldKey[]>([]);

  const audienceOptions = useMemo(
    () =>
      LABS_AUDIENCES.map((value) => ({
        value,
        label: copy.audiences[value] ?? value,
      })),
    [copy.audiences],
  );
  const timeOptions = useMemo(
    () =>
      LABS_TIME_SPENT.map((value) => ({
        value,
        label: copy.times[value] ?? value,
      })),
    [copy.times],
  );
  const expectationOptions = useMemo(
    () =>
      LABS_EXPECTATIONS.map((value) => ({
        value,
        label: copy.expectationOptions[value] ?? value,
      })),
    [copy.expectationOptions],
  );

  function isInvalid(key: FieldKey) {
    return invalidKeys.includes(key);
  }

  function fieldInputClass(key: FieldKey) {
    return `${baseInputClass} ${isInvalid(key) ? errInputClass : okInputClass}`;
  }

  function clearFieldError(key: FieldKey) {
    setInvalidKeys((prev) => prev.filter((k) => k !== key));
  }

  function toggleExpectation(value: string) {
    setExpectations((prev) => {
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      if (next.length > 0) clearFieldError("expectations");
      return next;
    });
  }

  function getMissing(): { key: FieldKey; label: string }[] {
    const missing: { key: FieldKey; label: string }[] = [];
    if (!name.trim()) missing.push({ key: "name", label: copy.name });
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      missing.push({ key: "email", label: copy.email });
    }
    if (!isValidPhone(phone)) {
      missing.push({ key: "phone", label: copy.phone });
    }
    if (!audience) missing.push({ key: "audience", label: copy.audience });
    if (!problem.trim()) missing.push({ key: "problem", label: copy.problem });
    if (!repeatingTasks.trim()) {
      missing.push({ key: "repeating", label: copy.repeating });
    }
    if (!timeSpent) missing.push({ key: "timeSpent", label: copy.timeSpent });
    if (expectations.length < 1) {
      missing.push({ key: "expectations", label: copy.expectations });
    }
    return missing;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const missing = getMissing();
    if (missing.length) {
      setInvalidKeys(missing.map((m) => m.key));
      setError(
        `${t("formRequiredPrefix")}: ${missing.map((m) => m.label).join(", ")}`,
      );
      return;
    }

    setError("");
    setInvalidKeys([]);
    setStatus("submitting");
    try {
      const res = await fetch("/api/labs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          audience,
          problem,
          repeatingTasks,
          timeSpent,
          expectations,
          notes,
          locale,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || copy.errorGeneric);
        setStatus("idle");
        return;
      }
      setStatus("done");
    } catch {
      setError(copy.errorGeneric);
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <section
        id="labs-form"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-12 sm:px-6"
      >
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500/15 via-emerald-500/10 to-violet-500/15 p-8 ring-1 ring-primary/20 sm:p-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {copy.successTitle}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted sm:text-base">
            {copy.successBody}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="labs-form"
      className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-12 sm:px-6"
    >
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {copy.formTitle}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted sm:text-base">
        {copy.formSub}
      </p>

      <form
        onSubmit={onSubmit}
        noValidate
        className="mt-8 space-y-5 rounded-3xl bg-panel p-5 shadow-card ring-1 ring-secondary sm:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label
            className={`block text-sm font-medium ${
              isInvalid("name") ? "text-rose-800" : "text-ink"
            }`}
          >
            {copy.name}
            <span className="text-rose-600"> *</span>
            <input
              maxLength={120}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (e.target.value.trim()) clearFieldError("name");
              }}
              className={fieldInputClass("name")}
              autoComplete="name"
              aria-required="true"
              aria-invalid={isInvalid("name")}
            />
          </label>
          <label
            className={`block text-sm font-medium ${
              isInvalid("email") ? "text-rose-800" : "text-ink"
            }`}
          >
            {copy.email}
            <span className="text-rose-600"> *</span>
            <input
              type="email"
              maxLength={254}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (e.target.value.trim()) clearFieldError("email");
              }}
              className={fieldInputClass("email")}
              autoComplete="email"
              aria-required="true"
              aria-invalid={isInvalid("email")}
            />
          </label>
        </div>

        <label
          className={`block text-sm font-medium ${
            isInvalid("phone") ? "text-rose-800" : "text-ink"
          }`}
        >
          {copy.phone}
          <span className="text-rose-600"> *</span>
          <input
            type="tel"
            maxLength={32}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (isValidPhone(e.target.value)) clearFieldError("phone");
            }}
            className={fieldInputClass("phone")}
            placeholder="+62…"
            autoComplete="tel"
            aria-required="true"
            aria-invalid={isInvalid("phone")}
          />
          <span className="mt-1 block text-xs text-ink-faint">
            {copy.phoneHint}
          </span>
        </label>

        <fieldset>
          <legend
            className={`text-sm font-medium ${
              isInvalid("audience") ? "text-rose-800" : "text-ink"
            }`}
          >
            {copy.audience}
            <span className="text-rose-600"> *</span>
          </legend>
          <div
            className={`mt-2 flex flex-wrap gap-2 ${
              isInvalid("audience")
                ? "rounded-xl bg-rose-100 p-3 ring-1 ring-rose-300"
                : ""
            }`}
          >
            {audienceOptions.map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-medium ring-1 transition sm:text-sm ${
                  audience === opt.value
                    ? "bg-primary text-white ring-primary"
                    : isInvalid("audience")
                      ? "bg-white text-rose-900 ring-rose-300"
                      : "bg-soft text-ink-muted ring-secondary hover:bg-secondary/40"
                }`}
              >
                <input
                  type="radio"
                  name="audience"
                  className="sr-only"
                  value={opt.value}
                  checked={audience === opt.value}
                  onChange={() => {
                    setAudience(opt.value);
                    clearFieldError("audience");
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label
          className={`block text-sm font-medium ${
            isInvalid("problem") ? "text-rose-800" : "text-ink"
          }`}
        >
          {copy.problem}
          <span className="text-rose-600"> *</span>
          <textarea
            rows={4}
            maxLength={5000}
            value={problem}
            onChange={(e) => {
              setProblem(e.target.value);
              if (e.target.value.trim()) clearFieldError("problem");
            }}
            className={fieldInputClass("problem")}
            aria-required="true"
            aria-invalid={isInvalid("problem")}
          />
          <span className="mt-1 block text-xs text-ink-faint">
            {copy.problemHint}
          </span>
        </label>

        <label
          className={`block text-sm font-medium ${
            isInvalid("repeating") ? "text-rose-800" : "text-ink"
          }`}
        >
          {copy.repeating}
          <span className="text-rose-600"> *</span>
          <textarea
            rows={3}
            maxLength={5000}
            value={repeatingTasks}
            onChange={(e) => {
              setRepeatingTasks(e.target.value);
              if (e.target.value.trim()) clearFieldError("repeating");
            }}
            className={fieldInputClass("repeating")}
            aria-required="true"
            aria-invalid={isInvalid("repeating")}
          />
          <span className="mt-1 block text-xs text-ink-faint">
            {copy.repeatingHint}
          </span>
        </label>

        <fieldset>
          <legend
            className={`text-sm font-medium ${
              isInvalid("timeSpent") ? "text-rose-800" : "text-ink"
            }`}
          >
            {copy.timeSpent}
            <span className="text-rose-600"> *</span>
          </legend>
          <div
            className={`mt-2 flex flex-wrap gap-2 ${
              isInvalid("timeSpent")
                ? "rounded-xl bg-rose-100 p-3 ring-1 ring-rose-300"
                : ""
            }`}
          >
            {timeOptions.map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-medium ring-1 transition sm:text-sm ${
                  timeSpent === opt.value
                    ? "bg-primary text-white ring-primary"
                    : isInvalid("timeSpent")
                      ? "bg-white text-rose-900 ring-rose-300"
                      : "bg-soft text-ink-muted ring-secondary hover:bg-secondary/40"
                }`}
              >
                <input
                  type="radio"
                  name="timeSpent"
                  className="sr-only"
                  value={opt.value}
                  checked={timeSpent === opt.value}
                  onChange={() => {
                    setTimeSpent(opt.value);
                    clearFieldError("timeSpent");
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend
            className={`text-sm font-medium ${
              isInvalid("expectations") ? "text-rose-800" : "text-ink"
            }`}
          >
            {copy.expectations}
            <span className="text-rose-600"> *</span>
          </legend>
          <div
            className={`mt-2 space-y-2 ${
              isInvalid("expectations")
                ? "rounded-xl bg-rose-100 p-3 ring-1 ring-rose-300"
                : ""
            }`}
          >
            {expectationOptions.map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2.5 text-sm ring-1 ${
                  isInvalid("expectations")
                    ? "bg-white text-rose-900 ring-rose-300"
                    : "bg-soft/80 text-ink-muted ring-secondary"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-secondary text-primary focus:ring-primary"
                  checked={expectations.includes(opt.value)}
                  onChange={() => toggleExpectation(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-ink">
          {copy.notes}
          <textarea
            rows={2}
            maxLength={5000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${baseInputClass} ${okInputClass}`}
          />
          <span className="mt-1 block text-xs text-ink-faint">
            {copy.notesHint}
          </span>
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-800 ring-1 ring-rose-200"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? copy.submitting : copy.submit}
        </button>
      </form>
    </section>
  );
}
