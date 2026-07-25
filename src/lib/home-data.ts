import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/i18n/locale";
import { filterByLocale } from "@/lib/i18n";
import { clampPage, pageRange } from "@/lib/pagination";
import {
  LIST_SELECT,
  LIST_SELECT_BASE,
  LIST_SELECT_BASE_GEN,
  LIST_SELECT_WITH_GEN,
  applyLocaleAvailabilityFilter,
  selectMissingPinColumns,
} from "@/lib/prompt-select";
import { createPublicClient } from "@/lib/supabase/public";

export type HomePromptRow = {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  category: string | null;
  like_count: number;
  copy_count: number;
  generate_count?: number | null;
  is_public: boolean;
  public_until: string | null;
  image_path: string | null;
  tags?: string[] | null;
  body?: string | null;
  title_en?: string | null;
  description_en?: string | null;
  body_en?: string | null;
  tags_en?: string[] | null;
  image_path_en?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  ai_platform?: string | null;
  admin_pin_global?: boolean | null;
  admin_pin_category?: boolean | null;
  admin_pinned_at?: string | null;
  owner_pinned_at?: string | null;
  profiles?: { username: string } | { username: string }[] | null;
};

async function runListSelect(
  build: (select: string) => PromiseLike<{
    data: unknown;
    error: { message: string } | null;
  }>,
  locale: Locale,
) {
  let res = await build(LIST_SELECT_WITH_GEN);
  if (selectMissingPinColumns(res.error?.message)) {
    res = await build(
      LIST_SELECT_WITH_GEN.replace(
        /, admin_pin_global, admin_pin_category, admin_pinned_at, owner_pinned_at/,
        "",
      ),
    );
  }
  if (res.error?.message?.includes("title_en")) {
    if (locale === "en") return { rows: [] as HomePromptRow[], error: null as string | null };
    res = await build(LIST_SELECT_BASE_GEN);
  }
  if (res.error?.message?.includes("generate_count")) {
    res = await build(locale === "en" ? LIST_SELECT : LIST_SELECT_BASE);
    if (res.error?.message?.includes("title_en") && locale === "id") {
      res = await build(LIST_SELECT_BASE);
    }
  }
  return {
    rows: filterByLocale(
      (res.data as HomePromptRow[] | null) ?? [],
      locale,
    ),
    error: res.error?.message ?? null,
  };
}

async function catalogCountUncached(locale: Locale): Promise<number> {
  const supabase = createPublicClient();
  let catalogQuery = supabase
    .from("prompts")
    .select("id", { count: "exact", head: true });
  try {
    catalogQuery = applyLocaleAvailabilityFilter(catalogQuery, locale);
  } catch {
    /* ignore */
  }
  const { count } = await catalogQuery;
  return count ?? 0;
}

async function listPageUncached(opts: {
  tag: string;
  page: number;
  perPage: number;
  locale: Locale;
}): Promise<{
  rows: HomePromptRow[];
  total: number;
  error: string | null;
  page: number;
}> {
  const supabase = createPublicClient();
  let countQuery = supabase
    .from("prompts")
    .select("id", { count: "exact", head: true });
  if (opts.tag) countQuery = countQuery.contains("tags", [opts.tag]);
  try {
    countQuery = applyLocaleAvailabilityFilter(countQuery, opts.locale);
  } catch {
    /* ignore */
  }
  const { count, error: countError } = await countQuery;
  let total = count ?? 0;
  if (countError?.message?.includes("title_en") && opts.locale === "en") {
    total = 0;
  }
  const page = clampPage(opts.page, total, opts.perPage);
  const { from, to } = pageRange(page, opts.perPage);

  const { rows, error } = await runListSelect(async (select) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .order("created_at", { ascending: false });
    if (opts.tag) query = query.contains("tags", [opts.tag]);
    query = applyLocaleAvailabilityFilter(query, opts.locale);
    return query.range(from, to);
  }, opts.locale);

  return {
    rows,
    total,
    error: error ?? countError?.message ?? null,
    page,
  };
}

async function engagementFeatured(
  locale: Locale,
  excludeIds: string[],
  limit: number,
): Promise<HomePromptRow[]> {
  if (limit <= 0) return [];
  const supabase = createPublicClient();
  const { rows } = await runListSelect(async (select) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .order("like_count", { ascending: false })
      .order("copy_count", { ascending: false })
      .limit(Math.max(limit + excludeIds.length, 20));
    query = applyLocaleAvailabilityFilter(query, locale);
    return query;
  }, locale);

  const exclude = new Set(excludeIds);
  return rows.filter((r) => !exclude.has(r.id)).slice(0, limit);
}

async function featuredUncached(locale: Locale): Promise<HomePromptRow[]> {
  const supabase = createPublicClient();
  const pinnedResult = await runListSelect(async (select) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .eq("admin_pin_global", true)
      .order("admin_pinned_at", { ascending: false, nullsFirst: false })
      .limit(10);
    query = applyLocaleAvailabilityFilter(query, locale);
    return query;
  }, locale);

  // If pin columns missing, fall back to engagement-only
  if (selectMissingPinColumns(pinnedResult.error)) {
    return engagementFeatured(locale, [], 10);
  }

  const pinned = pinnedResult.rows.slice(0, 10);
  const fill = await engagementFeatured(
    locale,
    pinned.map((p) => p.id),
    10 - pinned.length,
  );
  return [...pinned, ...fill];
}

async function categoryFeaturedUncached(
  locale: Locale,
  category: string,
): Promise<HomePromptRow[]> {
  const supabase = createPublicClient();
  const { rows, error } = await runListSelect(async (select) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .eq("category", category)
      .eq("admin_pin_category", true)
      .order("admin_pinned_at", { ascending: false, nullsFirst: false })
      .limit(10);
    query = applyLocaleAvailabilityFilter(query, locale);
    return query;
  }, locale);

  if (selectMissingPinColumns(error)) return [];
  return rows.slice(0, 10);
}

async function editorPicksUncached(opts: {
  locale: Locale;
  page: number;
  perPage: number;
}): Promise<{
  rows: HomePromptRow[];
  total: number;
  error: string | null;
  page: number;
}> {
  const supabase = createPublicClient();
  let countQuery = supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .not("owner_pinned_at", "is", null);
  try {
    countQuery = applyLocaleAvailabilityFilter(countQuery, opts.locale);
  } catch {
    /* ignore */
  }
  const { count, error: countError } = await countQuery;
  if (selectMissingPinColumns(countError?.message)) {
    return { rows: [], total: 0, error: null, page: 1 };
  }
  if (countError?.message?.includes("title_en") && opts.locale === "en") {
    return { rows: [], total: 0, error: null, page: 1 };
  }
  const total = count ?? 0;
  const page = clampPage(opts.page, total, opts.perPage);
  const { from, to } = pageRange(page, opts.perPage);

  const { rows, error } = await runListSelect(async (select) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .not("owner_pinned_at", "is", null)
      .order("owner_pinned_at", { ascending: false, nullsFirst: false });
    query = applyLocaleAvailabilityFilter(query, opts.locale);
    return query.range(from, to);
  }, opts.locale);

  return {
    rows,
    total,
    error: error ?? countError?.message ?? null,
    page,
  };
}

/** Cached public catalog count — cuts repeat TTFB. */
export function getCachedCatalogCount(locale: Locale) {
  return unstable_cache(
    () => catalogCountUncached(locale),
    [`home-catalog-count-${locale}`],
    { revalidate: 60, tags: ["prompts", `prompts-${locale}`] },
  )();
}

/** Cached homepage list page. */
export function getCachedListPage(opts: {
  tag: string;
  page: number;
  perPage: number;
  locale: Locale;
}) {
  return unstable_cache(
    () => listPageUncached(opts),
    [`home-list-${opts.locale}-${opts.tag}-${opts.page}-${opts.perPage}`],
    { revalidate: 60, tags: ["prompts", `prompts-${opts.locale}`] },
  )();
}

/** Cached featured strip (admin global pins + engagement fill). */
export function getCachedFeatured(locale: Locale) {
  return unstable_cache(
    () => featuredUncached(locale),
    [`home-featured-${locale}`],
    { revalidate: 60, tags: ["prompts", `prompts-${locale}`] },
  )();
}

/** Cached category admin-pin strip. */
export function getCachedCategoryFeatured(locale: Locale, category: string) {
  return unstable_cache(
    () => categoryFeaturedUncached(locale, category),
    [`category-featured-${locale}-${category}`],
    { revalidate: 60, tags: ["prompts", `prompts-${locale}`] },
  )();
}

/** Cached editor picks (owner pins). */
export function getCachedEditorPicks(opts: {
  locale: Locale;
  page: number;
  perPage: number;
}) {
  return unstable_cache(
    () => editorPicksUncached(opts),
    [
      `editor-picks-${opts.locale}-${opts.page}-${opts.perPage}`,
    ],
    { revalidate: 60, tags: ["prompts", `prompts-${opts.locale}`] },
  )();
}
