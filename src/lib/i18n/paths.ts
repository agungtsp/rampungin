import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/lib/i18n/locale";

/** Strip leading /id or /en; return locale + bare path (always starts with /). */
export function stripLocalePrefix(pathname: string): {
  locale: Locale | null;
  path: string;
} {
  const m = pathname.match(/^\/(id|en)(?=\/|$)/);
  if (!m || !isLocale(m[1])) {
    return { locale: null, path: pathname || "/" };
  }
  const rest = pathname.slice(m[0].length);
  return { locale: m[1], path: rest || "/" };
}

/** Prefix a site path with locale. `path` should be absolute (/trending) or empty. */
export function localePath(locale: Locale, path: string = "/"): string {
  const clean =
    !path || path === "/"
      ? ""
      : path.startsWith("/")
        ? path
        : `/${path}`;
  return `/${locale}${clean}`;
}

export function detectPreferredLocale(
  cookieValue: string | undefined | null,
): Locale {
  return cookieValue === "en" ? "en" : DEFAULT_LOCALE;
}
