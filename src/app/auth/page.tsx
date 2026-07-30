import { Suspense } from "react";
import type { Metadata } from "next";
import { FreeBadge } from "@/components/FreeBadge";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { RampunginLogo } from "@/components/RampunginLogo";
import { getServerLocale } from "@/lib/i18n/server";
import { noIndexMetadata } from "@/lib/seo";
import { AuthErrorBanner } from "./AuthErrorBanner";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return noIndexMetadata(
    locale,
    "/auth",
    locale === "en" ? "Sign in" : "Masuk",
  );
}

export default async function AuthPage() {
  const locale = await getServerLocale();
  const en = locale === "en";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-secondary bg-panel p-6 shadow-card">
        <div className="flex justify-center">
          <RampunginLogo className="h-16 w-16" />
        </div>
        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-bold text-ink">
            {en ? "Sign in to Rampungin" : "Masuk ke Rampungin"}
          </h1>
          <p className="text-sm text-ink-muted">
            {en
              ? "Sign in or register with Google. Create, share, and manage prompts — completely free."
              : "Masuk atau daftar dengan akun Google. Buat, bagikan, dan kelola prompt — sepenuhnya gratis."}
          </p>
          <div className="flex justify-center">
            <FreeBadge />
          </div>
        </div>
        <Suspense fallback={null}>
          <AuthErrorBanner />
        </Suspense>
        <Suspense fallback={<div className="h-12 rounded-xl bg-soft" />}>
          <GoogleLoginButton />
        </Suspense>
      </div>
    </main>
  );
}
