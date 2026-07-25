import type { Locale } from "@/lib/i18n/locale";
import { PROMPT_AUTHOR } from "@/lib/relations";

const I18N_COLS = "title_en, description_en, body_en, tags_en, image_path_en";

export const LIST_SELECT = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const LIST_SELECT_WITH_GEN = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const LIST_SELECT_BASE = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, ${PROMPT_AUTHOR}`;
export const LIST_SELECT_BASE_GEN = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, ${PROMPT_AUTHOR}`;

export const SEARCH_SELECT = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, tags, body, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const SEARCH_SELECT_WITH_GEN = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, tags, body, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const SEARCH_SELECT_BASE = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, tags, body, ${PROMPT_AUTHOR}`;

/** Apply PostgREST filters so unavailable locales are excluded server-side. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyLocaleAvailabilityFilter(query: any, locale: Locale) {
  if (locale === "en") {
    return query
      .not("title_en", "is", null)
      .neq("title_en", "")
      .not("body_en", "is", null)
      .neq("body_en", "");
  }
  return query.neq("title", "").neq("body", "");
}
