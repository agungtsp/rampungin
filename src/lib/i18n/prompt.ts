import type { Locale } from "./locale";

export type PromptI18nFields = {
  title: string;
  description?: string | null;
  body?: string | null;
  tags?: string[] | null;
  image_path?: string | null;
  title_en?: string | null;
  description_en?: string | null;
  body_en?: string | null;
  tags_en?: string[] | null;
  image_path_en?: string | null;
};

export type LocalizedPromptContent = {
  title: string;
  description: string | null;
  body: string;
  tags: string[] | null;
  /** Cover for this locale only — never falls back across languages */
  imagePath: string | null;
};

function filled(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

/** Prompt is visible in a locale only when title AND body for that locale are filled. */
export function isAvailableInLocale(
  prompt: PromptI18nFields,
  locale: Locale,
): boolean {
  if (locale === "en") {
    return filled(prompt.title_en) && filled(prompt.body_en);
  }
  return filled(prompt.title) && filled(prompt.body);
}

export function localizePrompt(
  prompt: PromptI18nFields,
  locale: Locale,
): LocalizedPromptContent {
  if (locale === "en" && isAvailableInLocale(prompt, "en")) {
    return {
      title: prompt.title_en!.trim(),
      description: prompt.description_en?.trim() || null,
      body: prompt.body_en!.trim(),
      tags: prompt.tags_en ?? [],
      imagePath: prompt.image_path_en?.trim() || null,
    };
  }
  return {
    title: prompt.title.trim(),
    description: prompt.description?.trim() || null,
    body: (prompt.body ?? "").trim(),
    tags: prompt.tags ?? [],
    imagePath: prompt.image_path?.trim() || null,
  };
}

export function preferredDisplayLocale(
  prompt: PromptI18nFields,
  preferred: Locale,
): Locale {
  if (isAvailableInLocale(prompt, preferred)) return preferred;
  const other: Locale = preferred === "en" ? "id" : "en";
  if (isAvailableInLocale(prompt, other)) return other;
  return preferred;
}

export function filterByLocale<T extends PromptI18nFields>(
  rows: T[],
  locale: Locale,
): T[] {
  return rows.filter((row) => isAvailableInLocale(row, locale));
}
