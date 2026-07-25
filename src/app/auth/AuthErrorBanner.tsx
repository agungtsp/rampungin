"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n";

export function AuthErrorBanner() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const error = searchParams.get("error");
  if (!error) return null;

  const message =
    error === "missing_code"
      ? locale === "en"
        ? "Sign-in was cancelled or the OAuth code was missing. Please try again."
        : "Login dibatalkan atau kode OAuth tidak ditemukan. Silakan coba lagi."
      : locale === "en"
        ? `Sign-in failed: ${error}`
        : `Login gagal: ${error}`;

  return (
    <p
      role="alert"
      className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200"
    >
      {message}
    </p>
  );
}
