import { NextResponse } from "next/server";
import { LOCALE_COOKIE, parseLocale } from "@/lib/i18n/locale";
import { localePath, stripLocalePrefix } from "@/lib/i18n/paths";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function localeFromNextOrCookie(
  next: string,
  cookieValue: string | undefined,
): "id" | "en" {
  const { locale: fromNext } = stripLocalePrefix(next);
  if (fromNext) return fromNext;
  return parseLocale(cookieValue);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]+)`),
  );
  const locale = localeFromNextOrCookie(next, cookieMatch?.[1]);
  const authErrorPath = localePath(locale, "/auth");

  if (!code) {
    return NextResponse.redirect(`${origin}${authErrorPath}?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}${authErrorPath}?error=${encodeURIComponent(error.message)}`,
    );
  }

  const dest = next.startsWith("/id") || next.startsWith("/en")
    ? next
    : localePath(locale, next);
  return NextResponse.redirect(`${origin}${dest}`);
}
