"use client";

import { useLocale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme/ThemeProvider";

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4.25" />
      <g stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2" />
        <path d="m5.05 5.05 1.55 1.55M17.4 17.4l1.55 1.55M5.05 18.95l1.55-1.55M17.4 6.6l1.55-1.55" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.5 14.2A8.2 8.2 0 0 1 9.8 3.5 7.1 7.1 0 1 0 20.5 14.2Z" />
    </svg>
  );
}

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { locale } = useLocale();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-soft px-2.5 text-ink ring-1 ring-secondary/50 transition hover:bg-secondary/25 sm:px-3"
      aria-label={
        isDark
          ? locale === "en"
            ? "Switch to light theme"
            : "Ganti ke tema terang"
          : locale === "en"
            ? "Switch to dark theme"
            : "Ganti ke tema gelap"
      }
      title={isDark ? "Light mode" : "Dark mode"}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          isDark
            ? "bg-amber-300 text-amber-950"
            : "bg-slate-800 text-amber-200"
        }`}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
      <span className="hidden text-xs font-semibold sm:inline">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
