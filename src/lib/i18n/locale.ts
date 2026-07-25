export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "rampungin_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "id" || value === "en";
}

export function parseLocale(value: string | null | undefined): Locale {
  return value === "en" ? "en" : "id";
}
