import { Suspense } from "react";
import { FreeBadge } from "@/components/FreeBadge";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { getServerLocale } from "@/lib/i18n/server";
import { AuthErrorBanner } from "./AuthErrorBanner";

export default async function AuthPage() {
  const locale = await getServerLocale();
  const en = locale === "en";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-4 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-primary-hover">
          {en ? "Sign in to Rampungin" : "Masuk ke Rampungin"}
        </h1>
        <p className="text-ink-muted">
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
    </main>
  );
}
