export type Theme = "light" | "dark";

export const THEME_COOKIE = "rampungin_theme";
export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function parseTheme(value: string | null | undefined): Theme {
  return value === "dark" ? "dark" : "light";
}

export function themeClass(theme: Theme): string {
  return theme === "dark" ? "dark" : "";
}
