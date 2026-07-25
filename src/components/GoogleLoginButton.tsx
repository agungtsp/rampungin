"use client";

import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { trackLogin } from "@/lib/analytics";
import { useLocale } from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";

export function GoogleLoginButton() {
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const rawNext = searchParams.get("next") || localePath(locale, "/");
  const next =
    rawNext.startsWith("/id") || rawNext.startsWith("/en")
      ? rawNext
      : localePath(locale, rawNext);

  async function login() {
    trackLogin("google");
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
      className="w-full rounded-xl bg-primary-hover px-4 py-3 text-white hover:bg-primary-hover"
    >
      {locale === "en" ? "Continue with Google" : "Lanjutkan dengan Google"}
    </button>
  );
}
