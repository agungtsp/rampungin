import type { Locale } from "@/lib/i18n/locale";

export type AiPlatform = "chatgpt" | "gemini" | "all";

export const AI_PLATFORMS: {
  value: AiPlatform;
  labelId: string;
  labelEn: string;
}[] = [
  { value: "all", labelId: "Semua (ChatGPT & AI Studio)", labelEn: "All (ChatGPT & AI Studio)" },
  { value: "chatgpt", labelId: "ChatGPT", labelEn: "ChatGPT" },
  { value: "gemini", labelId: "AI Studio (Gemini)", labelEn: "AI Studio (Gemini)" },
];

export function parseAiPlatform(value: unknown): AiPlatform {
  if (value === "chatgpt" || value === "gemini" || value === "all") return value;
  return "all";
}

export function aiPlatformLabel(
  platform: AiPlatform | string | null | undefined,
  locale: Locale,
): string {
  const p = parseAiPlatform(platform);
  const row = AI_PLATFORMS.find((x) => x.value === p)!;
  return locale === "en" ? row.labelEn : row.labelId;
}

export function aiPlatformBadge(
  platform: AiPlatform | string | null | undefined,
): string {
  const p = parseAiPlatform(platform);
  if (p === "chatgpt") return "ChatGPT";
  if (p === "gemini") return "AI Studio";
  return "All";
}
