import type { Locale } from "@/lib/i18n/locale";
import { PROMPT_AUTHOR } from "@/lib/relations";

const I18N_COLS = "title_en, description_en, body_en, tags_en, image_path_en";
/** Indonesian body/tags required for filterByLocale(id); mirrors EN cols in I18N_COLS */
const ID_CONTENT_COLS = "body, tags";
const RATING_COLS = "rating_avg, rating_count";
const META_COLS = "ai_platform";
const PIN_COLS =
  "admin_pin_global, admin_pin_category, admin_pinned_at, owner_pinned_at";

export const LIST_SELECT = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, ${ID_CONTENT_COLS}, ${RATING_COLS}, ${META_COLS}, ${PIN_COLS}, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const LIST_SELECT_WITH_GEN = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, ${ID_CONTENT_COLS}, ${RATING_COLS}, ${META_COLS}, ${PIN_COLS}, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const LIST_SELECT_BASE = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, ${ID_CONTENT_COLS}, ${RATING_COLS}, ${META_COLS}, ${PIN_COLS}, ${PROMPT_AUTHOR}`;
export const LIST_SELECT_BASE_GEN = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, ${ID_CONTENT_COLS}, ${RATING_COLS}, ${META_COLS}, ${PIN_COLS}, ${PROMPT_AUTHOR}`;

export const SEARCH_SELECT = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, tags, body, ${RATING_COLS}, ${META_COLS}, ${PIN_COLS}, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const SEARCH_SELECT_WITH_GEN = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, tags, body, ${RATING_COLS}, ${META_COLS}, ${PIN_COLS}, ${I18N_COLS}, ${PROMPT_AUTHOR}`;
export const SEARCH_SELECT_BASE = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, tags, body, ${RATING_COLS}, ${META_COLS}, ${PIN_COLS}, ${PROMPT_AUTHOR}`;

export function selectMissingPinColumns(message?: string | null): boolean {
  return Boolean(
    message &&
      (message.includes("admin_pin_global") ||
        message.includes("admin_pin_category") ||
        message.includes("admin_pinned_at") ||
        message.includes("owner_pinned_at")),
  );
}

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
  return query
    .not("title", "is", null)
    .neq("title", "")
    .not("body", "is", null)
    .neq("body", "");
}
