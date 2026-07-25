import { unstable_cache } from "next/cache";
import type { Locale } from "@/lib/i18n/locale";
import { filterByLocale } from "@/lib/i18n";
import {
  clampPage,
  pageRange,
} from "@/lib/pagination";
import {
  LIST_SELECT,
  LIST_SELECT_BASE,
  LIST_SELECT_BASE_GEN,
  LIST_SELECT_WITH_GEN,
  applyLocaleAvailabilityFilter,
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
  profiles?: { username: string } | { username: string }[] | null;
};

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

  const attempt = async (select: string) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .order("created_at", { ascending: false });
    if (opts.tag) query = query.contains("tags", [opts.tag]);
    query = applyLocaleAvailabilityFilter(query, opts.locale);
    return query.range(from, to);
  };

  let res = await attempt(LIST_SELECT_WITH_GEN);
  if (res.error?.message?.includes("title_en")) {
    if (opts.locale === "en") {
      return { rows: [], total: 0, error: null, page: 1 };
    }
    res = await attempt(LIST_SELECT_BASE_GEN);
  }
  if (res.error?.message?.includes("generate_count")) {
    res = await attempt(
      res.error?.message?.includes("title_en") ? LIST_SELECT_BASE : LIST_SELECT,
    );
    if (res.error?.message?.includes("title_en") && opts.locale === "id") {
      res = await attempt(LIST_SELECT_BASE);
    }
  }
  return {
    rows: filterByLocale(
      (res.data as unknown as HomePromptRow[] | null) ?? [],
      opts.locale,
    ),
    total,
    error: res.error?.message ?? countError?.message ?? null,
    page,
  };
}

async function featuredUncached(locale: Locale): Promise<HomePromptRow[]> {
  const supabase = createPublicClient();
  const attempt = async (select: string) => {
    const query = supabase
      .from("prompts")
      .select(select)
      .order("like_count", { ascending: false })
      .order("copy_count", { ascending: false })
      .limit(20);
    return applyLocaleAvailabilityFilter(query, locale).limit(10);
  };

  let res = await attempt(LIST_SELECT_WITH_GEN);
  if (res.error?.message?.includes("title_en")) {
    if (locale === "en") return [];
    res = await attempt(LIST_SELECT_BASE_GEN);
  }
  if (res.error?.message?.includes("generate_count")) {
    res = await attempt(locale === "en" ? LIST_SELECT : LIST_SELECT_BASE);
  }
  return filterByLocale(
    (res.data as unknown as HomePromptRow[] | null) ?? [],
    locale,
  ).slice(0, 10);
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
    [
      `home-list-${opts.locale}-${opts.tag}-${opts.page}-${opts.perPage}`,
    ],
    { revalidate: 60, tags: ["prompts", `prompts-${opts.locale}`] },
  )();
}

/** Cached featured strip. */
export function getCachedFeatured(locale: Locale) {
  return unstable_cache(
    () => featuredUncached(locale),
    [`home-featured-${locale}`],
    { revalidate: 60, tags: ["prompts", `prompts-${locale}`] },
  )();
}
