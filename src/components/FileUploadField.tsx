"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n";

type Props = {
  accept?: string;
  label?: string;
  buttonLabel?: string;
  hint?: string;
  fileName?: string | null;
  onChange: (file: File | null) => void;
  /** Optional existing image URL for preview */
  previewUrl?: string | null;
  previewAlt?: string;
  showPreview?: boolean;
};

export function FileUploadField({
  accept = "image/jpeg,image/png,image/webp",
  label,
  buttonLabel,
  hint,
  fileName,
  onChange,
  previewUrl,
  previewAlt,
  showPreview = false,
}: Props) {
  const { locale } = useLocale();
  const inputId = useId();
  const [picked, setPicked] = useState<File | null>(null);

  const pickLabel =
    buttonLabel ??
    (locale === "en" ? "Choose file" : "Pilih file");

  const blobUrl = useMemo(() => {
    if (!picked) return null;
    return URL.createObjectURL(picked);
  }, [picked]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const displayPreview = blobUrl ?? previewUrl ?? null;
  const displayName = picked?.name ?? fileName ?? null;

  return (
    <div className="space-y-2">
      {label ? (
        <span className="block text-sm font-medium text-ink">{label}</span>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        {showPreview ? (
          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-soft ring-1 ring-ink/20">
            {displayPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayPreview}
                alt={previewAlt ?? (locale === "en" ? "Preview" : "Pratinjau")}
                title={previewAlt ?? (locale === "en" ? "Preview" : "Pratinjau")}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xs text-ink-faint"
                title={locale === "en" ? "No image yet" : "Belum ada gambar"}
              >
                {locale === "en" ? "No image" : "Kosong"}
              </div>
            )}
          </div>
        ) : null}

        <div className="min-w-0 space-y-1.5">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
            title={pickLabel}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M12 16V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" strokeLinecap="round" />
            </svg>
            {pickLabel}
          </label>
          <input
            id={inputId}
            type="file"
            accept={accept}
            className="sr-only"
            title={pickLabel}
            aria-label={pickLabel}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setPicked(file);
              onChange(file);
            }}
          />
          {displayName ? (
            <p
              className="max-w-[16rem] truncate text-xs font-medium text-ink"
              title={displayName}
            >
              {displayName}
            </p>
          ) : (
            <p className="text-xs text-ink-muted">
              {locale === "en" ? "No file selected" : "Belum ada file dipilih"}
            </p>
          )}
          {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
