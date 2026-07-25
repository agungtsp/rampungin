import Link from "next/link";
import { CategoryChips } from "@/components/CategoryChips";
import { PaginationControls } from "@/components/PaginationControls";
import {
  PaginationShell,
  PromptGridSkeleton,
} from "@/components/PaginationShell";
import { PromptCard } from "@/components/PromptCard";
import { SmartSearchResultsBar } from "@/components/SmartSearchResultsBar";
import {
  filterByLocale,
  localizePrompt,
  translate,
  type Locale,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import {
  LIST_SELECT,
  LIST_SELECT_BASE,
  LIST_SELECT_BASE_GEN,
  LIST_SELECT_WITH_GEN,
  SEARCH_SELECT,
  SEARCH_SELECT_BASE,
  SEARCH_SELECT_WITH_GEN,
  applyLocaleAvailabilityFilter,
} from "@/lib/prompt-select";
import { asOne } from "@/lib/relations";
import {
  buildOrIlikeFilter,
  categoryFromIntent,
  rankPromptsByIntent,
} from "@/lib/smart-search";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";

type PromptRow = {
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

function CardGrid({ items, locale }: { items: PromptRow[]; locale: Locale }) {
  return (
    <div className="marketplace-grid">
      {items.map((p) => {
        const author = asOne(p.profiles ?? null);
        const loc = localizePrompt(
          {
            title: p.title,
            description: p.description,
            body: p.body ?? "",
            tags: p.tags ?? null,
            image_path: p.image_path,
            title_en: p.title_en,
            description_en: p.description_en,
            body_en: p.body_en,
            tags_en: p.tags_en,
            image_path_en: p.image_path_en,
          },
          locale,
        );
        return (
          <PromptCard
            key={p.id}
            id={p.id}
            title={loc.title}
            description={loc.description}
            mode={p.mode}
            category={p.category}
            like_count={p.like_count}
            copy_count={p.copy_count}
            generate_count={p.generate_count ?? 0}
            is_public={p.is_public}
            public_until={p.public_until}
            authorUsername={author?.username}
            imageUrl={publicImageUrl(loc.imagePath)}
            rating_avg={p.rating_avg}
            rating_count={p.rating_count}
            ai_platform={p.ai_platform}
          />
        );
      })}
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    page?: string;
    perPage?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tag = sp.tag?.trim() ?? "";
  const perPage = parsePageSize(sp.perPage ?? "20");
  let page = parsePage(sp.page);
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const supabase = await createClient();

  const { count: catalogCount } = await supabase
    .from("prompts")
    .select("id", { count: "exact", head: true });
  const totalCatalog = catalogCount ?? 0;

  const intentCategory = q ? categoryFromIntent(q) : null;
  let prompts: PromptRow[] = [];
  let featured: PromptRow[] = [];
  let total = 0;
  let promptsError: string | null = null;
  let smartNote: string | null = null;

  if (q) {
    const { rows, error } = await fetchCandidates(supabase, q, tag, locale);
    if (error) promptsError = error;
    const ranked = filterByLocale(rankPromptsByIntent(rows, q), locale);
    total = ranked.length;
    page = clampPage(page, total, perPage);
    const { from, to } = pageRange(page, perPage);
    prompts = ranked.slice(from, to + 1);
    if (intentCategory) {
      smartNote =
        locale === "en"
          ? `Detected category: ${intentCategory.label} — sorted by relevance.`
          : `Kategori terdeteksi: ${intentCategory.label} — diurutkan berdasarkan relevansi.`;
    } else if (ranked.length) {
      smartNote =
        locale === "en"
          ? "Sorted by match to your search context."
          : "Diurutkan berdasarkan kecocokan dengan konteks pencarianmu.";
    }
  } else {
    const result = await listPage(supabase, { tag, page, perPage, locale });
    prompts = result.rows;
    total = result.total;
    page = result.page;
    promptsError = result.error;

    if (page === 1 && !tag) {
      featured = await fetchFeatured(supabase, locale);
    }
  }

  const keep = { q: q || undefined, tag: tag || undefined };

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6">
      {!q ? (
        <section className="animate-fade-up border-b border-secondary/60 py-8 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-soft px-3 py-1 text-xs font-semibold text-primary-hover">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {t("heroBadge")} · {totalCatalog}+ prompt
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.1]">
              {t("heroTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-xl px-1 text-sm text-ink-muted sm:text-lg">
              {t("heroSubtitle")}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
              <Link
                href="/prompts/new"
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover sm:px-5"
              >
                {t("heroShare")}
              </Link>
              <Link
                href="/trending"
                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink ring-1 ring-secondary/50 transition hover:bg-soft sm:px-5"
              >
                {t("heroTrending")}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <div className="sticky top-14 z-30 -mx-3 sm:-mx-6">
        <CategoryChips />
      </div>

      <div className="space-y-10 py-8">
        {q ? <SmartSearchResultsBar note={smartNote} query={q} /> : null}

        {!q && featured.length > 0 ? (
          <section className="space-y-4 animate-fade-up">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {t("featured")}
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">{t("featuredSub")}</p>
              </div>
              <Link
                href="/trending"
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t("seeAll")}
              </Link>
            </div>
            <CardGrid items={featured} locale={locale} />
          </section>
        ) : null}

        <PaginationShell
          skeleton={<PromptGridSkeleton count={perPage} />}
          content={
            <>
              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                      {q ? t("searchResults") : t("latest")}
                    </h2>
                    {!q ? (
                      <p className="mt-0.5 text-sm text-ink-muted">
                        {t("latestSub")}
                      </p>
                    ) : null}
                  </div>
                  {!q ? (
                    <Link
                      href="/trending"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {t("navTrending")}
                    </Link>
                  ) : null}
                </div>
                <CardGrid items={prompts} locale={locale} />
              </section>

              {!prompts.length ? (
                <p className="py-12 text-center text-ink-muted">
                  {promptsError
                    ? `${t("loadError")}: ${promptsError}`
                    : q
                      ? t("emptySearch")
                      : t("emptyCatalog")}
                </p>
              ) : null}
            </>
          }
          controls={
            <PaginationControls
              basePath="/"
              page={page}
              perPage={perPage}
              total={total}
              params={keep}
            />
          }
        />
      </div>
    </main>
  );
}

async function listPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  opts: { tag: string; page: number; perPage: number; locale: Locale },
): Promise<{
  rows: PromptRow[];
  total: number;
  error: string | null;
  page: number;
}> {
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
      res.error?.message?.includes("title_en")
        ? LIST_SELECT_BASE
        : LIST_SELECT,
    );
    if (res.error?.message?.includes("title_en") && opts.locale === "id") {
      res = await attempt(LIST_SELECT_BASE);
    }
  }
  return {
    rows: filterByLocale(
      (res.data as unknown as PromptRow[] | null) ?? [],
      opts.locale,
    ),
    total,
    error: res.error?.message ?? countError?.message ?? null,
    page,
  };
}

async function fetchFeatured(
  supabase: Awaited<ReturnType<typeof createClient>>,
  locale: Locale,
): Promise<PromptRow[]> {
  const attempt = async (select: string) => {
    let query = supabase
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
    (res.data as unknown as PromptRow[] | null) ?? [],
    locale,
  ).slice(0, 10);
}

async function fetchCandidates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  intent: string,
  tag: string,
  locale: Locale,
): Promise<{ rows: PromptRow[]; error: string | null }> {
  const orFilter = buildOrIlikeFilter(intent);
  const run = async (select: string) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .order("created_at", { ascending: false })
      .limit(80);
    if (tag) query = query.contains("tags", [tag]);
    if (orFilter) query = query.or(orFilter);
    return applyLocaleAvailabilityFilter(query, locale);
  };

  let res = await run(SEARCH_SELECT_WITH_GEN);
  if (res.error?.message?.includes("title_en")) {
    if (locale === "en") return { rows: [], error: null };
    res = await run(SEARCH_SELECT_BASE);
  }
  if (res.error?.message?.includes("generate_count")) {
    res = await run(SEARCH_SELECT);
  }
  if (res.error) {
    const fb = await supabase
      .from("prompts")
      .select(SEARCH_SELECT_BASE)
      .ilike("title", `%${intent.slice(0, 80)}%`)
      .limit(120);
    return {
      rows: filterByLocale(
        (fb.data as unknown as PromptRow[] | null) ?? [],
        locale,
      ),
      error: res.error.message,
    };
  }
  return {
    rows: filterByLocale(
      (res.data as unknown as PromptRow[] | null) ?? [],
      locale,
    ),
    error: null,
  };
}
