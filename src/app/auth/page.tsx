import { Suspense } from "react";
import { FreeBadge } from "@/components/FreeBadge";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

export default function AuthPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-6 px-4 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold text-blue-950">Masuk ke Rampungin</h1>
        <p className="text-blue-900/70">
          Login/register dengan akun Google. Buat, share, dan kelola prompt — gratis.
        </p>
        <div className="flex justify-center">
          <FreeBadge />
        </div>
      </div>
      <Suspense fallback={<div className="h-12 rounded-xl bg-blue-100" />}>
        <GoogleLoginButton />
      </Suspense>
    </main>
  );
}
