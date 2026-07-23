export function asOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

/** Disambiguate prompts→profiles (author) vs prompts↔profiles via likes. */
export const PROMPT_AUTHOR =
  "profiles!prompts_author_id_fkey(username)" as const;

export const PROMPT_AUTHOR_FULL =
  "profiles!prompts_author_id_fkey(username, display_name)" as const;
