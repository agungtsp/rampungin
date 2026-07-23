"use client";

import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function GoogleLoginButton() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  async function login() {
    const supabase = createClient();
    const origin = window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={login}
      className="w-full rounded-xl bg-blue-800 px-4 py-3 text-white hover:bg-blue-900"
    >
      Lanjutkan dengan Google
    </button>
  );
}
