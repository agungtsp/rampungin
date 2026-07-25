import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import {
  detectPreferredLocale,
  localePath,
  stripLocalePrefix,
} from "@/lib/i18n/paths";

function isSkippedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/brand") ||
    pathname.startsWith("/bg") ||
    pathname === "/icon.svg" ||
    pathname === "/apple-icon" ||
    pathname === "/opengraph-image" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function pathNeedsAuth(barePath: string): boolean {
  return (
    barePath === "/me" ||
    barePath === "/saved" ||
    barePath === "/prompts/new" ||
    /^\/prompts\/[^/]+\/edit$/.test(barePath) ||
    /^\/profile\/[^/]+\/[^/]+\/edit$/.test(barePath)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isSkippedPath(pathname)) {
    return NextResponse.next();
  }

  const { locale: urlLocale, path: barePath } = stripLocalePrefix(pathname);

  // No locale prefix → redirect to preferred locale
  if (!urlLocale) {
    const preferred = detectPreferredLocale(
      request.cookies.get(LOCALE_COOKIE)?.value,
    );
    const url = request.nextUrl.clone();
    url.pathname = localePath(preferred, barePath);
    return NextResponse.redirect(url);
  }

  // Rewrite /id/foo → /foo while keeping cookie in sync
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = barePath;

  let response = NextResponse.rewrite(rewriteUrl);
  response.cookies.set(LOCALE_COOKIE, urlLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Skip Supabase auth refresh on public pages (big TTFB win)
  if (!pathNeedsAuth(barePath)) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.rewrite(rewriteUrl);
        response.cookies.set(LOCALE_COOKIE, urlLocale, {
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
          sameSite: "lax",
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = localePath(urlLocale, "/auth");
    redirectUrl.search = "";
    redirectUrl.searchParams.set(
      "next",
      `${localePath(urlLocale, barePath)}${search}`,
    );
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\..*|api/|auth/callback).*)",
  ],
};
