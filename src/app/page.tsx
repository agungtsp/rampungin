import { CategoryChips } from "@/components/CategoryChips";
import { LocaleLink } from "@/components/LocaleLink";
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
  getCachedCatalogCount,
  getCachedFeatured,
  getCachedListPage,
  type HomePromptRow,
} from "@/lib/home-data";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import {
  SEARCH_SELECT,
  SEARCH_SELECT_BASE,
  SEARCH_SELECT_WITH_GEN,
  applyLocaleAvailabilityFilter,
} from "@/lib/prompt-select";
import { asOne } from "@/lib/relations";
import { buildPageMetadata, siteCopy } from "@/lib/seo";
import {
  buildOrIlikeFilter,
  categoryFromIntent,
  rankPromptsByIntent,
} from "@/lib/smart-search";
import { createPublicClient } from "@/lib/supabase/public";
import { publicImageUrl } from "@/lib/storage";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const locale = await getServerLocale();
  const sp = await searchParams;
  const q = sp.q?.trim();
  const copy = siteCopy(locale);
  if (q) {
    return buildPageMetadata({
      locale,
      barePath: "/",
      title:
        locale === "en"
          ? `Search: ${q} — Rampungin`
          : `Cari: ${q} — Rampungin`,
      description: copy.description,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    locale,
    barePath: "/",
    title: copy.title,
    description: copy.description,
  });
}

type PromptRow = HomePromptRow;

function CardGrid({
  items,
  locale,
  isLoggedIn = false,
  priorityCount = 0,
  variant = "grid",
}: {
  items: PromptRow[];
  locale: Locale;
  isLoggedIn?: boolean;
  /** How many leading cards get high fetchPriority (LCP). Keep ≤2. */
  priorityCount?: number;
  variant?: "grid" | "bento";
}) {
  return (
    <div className={variant === "bento" ? "featured-bento" : "marketplace-grid"}>
      {items.map((p, index) => {
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
            isLoggedIn={isLoggedIn}
            priority={index < priorityCount}
            editorPick={Boolean(p.owner_pinned_at)}
            adminPinned={Boolean(p.admin_pin_global || p.admin_pin_category)}
          />
        );
      })}
    </div>
  );
}

async function hasSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  return jar.getAll().some((c) => c.name.includes("-auth-token"));
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
  const isLoggedIn = await hasSessionCookie();

  const intentCategory = q ? categoryFromIntent(q) : null;
  let prompts: PromptRow[] = [];
  let featured: PromptRow[] = [];
  let total = 0;
  let totalCatalog = 0;
  let promptsError: string | null = null;
  let smartNote: string | null = null;

  if (q) {
    const [{ rows, error }, catalogCount] = await Promise.all([
      fetchCandidates(q, tag, locale),
      getCachedCatalogCount(locale),
    ]);
    totalCatalog = catalogCount;
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
    const wantFeatured = page === 1 && !tag;
    const [catalogCount, listResult, featuredRows] = await Promise.all([
      getCachedCatalogCount(locale),
      getCachedListPage({ tag, page, perPage, locale }),
      wantFeatured
        ? getCachedFeatured(locale)
        : Promise.resolve([] as PromptRow[]),
    ]);
    totalCatalog = catalogCount;
    prompts = listResult.rows;
    total = listResult.total;
    page = listResult.page;
    promptsError = listResult.error;
    featured = featuredRows;
  }

  const keep = { q: q || undefined, tag: tag || undefined };

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6">
      {!q ? (
        <section className="animate-fade-up py-6 sm:py-8">
          <div className="stage-panel relative overflow-hidden rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-10 sm:py-12">
            <p className="mb-3 text-xs font-semibold text-white/70">
              {t("heroBadge")} · {totalCatalog}+ {t("promptCountSuffix")}
            </p>
            <h1 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
              {t("heroTitle")}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-lg">
              {t("heroSubtitle")}
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
              <LocaleLink
                href="/prompts/new"
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover sm:px-5"
              >
                {t("heroShare")}
              </LocaleLink>
              <LocaleLink
                href="/trending"
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 sm:px-5"
              >
                {t("heroTrending")}
              </LocaleLink>
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
              <LocaleLink
                href="/trending"
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t("seeAll")}
              </LocaleLink>
            </div>
            <CardGrid
              items={featured.slice(0, 3)}
              locale={locale}
              isLoggedIn={isLoggedIn}
              priorityCount={2}
            />
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
                    <LocaleLink
                      href="/trending"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {t("navTrending")}
                    </LocaleLink>
                  ) : null}
                </div>
                <CardGrid
                  items={prompts}
                  locale={locale}
                  isLoggedIn={isLoggedIn}
                  priorityCount={featured.length ? 0 : 2}
                />
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

async function fetchCandidates(
  intent: string,
  tag: string,
  locale: Locale,
): Promise<{ rows: PromptRow[]; error: string | null }> {
  const supabase = createPublicClient();
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
