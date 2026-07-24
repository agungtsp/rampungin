"use client";

import { useSearchParams } from "next/navigation";

export function AuthErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error) return null;

  const message =
    error === "missing_code"
      ? "Login dibatalkan atau kode OAuth tidak ditemukan. Silakan coba lagi."
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
