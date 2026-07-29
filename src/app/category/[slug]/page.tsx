import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CategoryChips } from "@/components/CategoryChips";
import { CategoryIcon } from "@/components/CategoryIcon";
import { LocaleLink } from "@/components/LocaleLink";
import { PaginationControls } from "@/components/PaginationControls";
import {
  PaginationShell,
  PromptGridSkeleton,
} from "@/components/PaginationShell";
import { PromptCard } from "@/components/PromptCard";
import {
  categoryIconName,
  categoryLabel,
  isValidCategory,
} from "@/lib/categories";
import {
  filterByLocale,
  localizePrompt,
  translate,
} from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import {
  getCachedCategoryFeatured,
  type HomePromptRow,
} from "@/lib/home-data";
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
  applyLocaleAvailabilityFilter,
  selectMissingPinColumns,
} from "@/lib/prompt-select";
import { asOne } from "@/lib/relations";
import { buildPageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getServerLocale();
  const label = categoryLabel(slug, locale);
  return buildPageMetadata({
    locale,
    barePath: `/category/${slug}`,
    title:
      locale === "en"
        ? `${label} prompts`
        : `Prompt ${label}`,
    description:
      locale === "en"
        ? `Browse free ${label} AI prompts on Rampungin.`
        : `Jelajahi prompt AI ${label} gratis di Rampungin.`,
  });
}

type Row = {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  category: string | null;
  like_count: number;
  copy_count: number;
  generate_count?: number;
  is_public: boolean;
  public_until: string | null;
  image_path: string | null;
  body?: string | null;
  title_en?: string | null;
  description_en?: string | null;
  body_en?: string | null;
  tags_en?: string[] | null;
  tags?: string[] | null;
  image_path_en?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  ai_platform?: string | null;
  admin_pin_global?: boolean | null;
  admin_pin_category?: boolean | null;
  owner_pinned_at?: string | null;
  profiles: { username: string } | { username: string }[] | null;
};

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { slug } = await params;
  if (!isValidCategory(slug)) notFound();

  const sp = await searchParams;
  const perPage = parsePageSize(sp.perPage);
  let page = parsePage(sp.page);
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  let countQuery = supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);
  countQuery = applyLocaleAvailabilityFilter(countQuery, locale);
  const { count: rawCount, error: countError } = await countQuery;
  let total = rawCount ?? 0;
  if (countError?.message?.includes("title_en") && locale === "en") total = 0;
  page = clampPage(page, total, perPage);
  const { from, to } = pageRange(page, perPage);

  const attempt = async (select: string) => {
    let q = supabase
      .from("prompts")
      .select(select)
      .eq("category", slug)
      .order("created_at", { ascending: false });
    q = applyLocaleAvailabilityFilter(q, locale);
    return q.range(from, to);
  };

  let res = await attempt(LIST_SELECT_WITH_GEN);
  let prompts: Row[] = [];
  if (selectMissingPinColumns(res.error?.message)) {
    res = await attempt(
      LIST_SELECT_WITH_GEN.replace(
        /, admin_pin_global, admin_pin_category, admin_pinned_at, owner_pinned_at/,
        "",
      ),
    );
  }
  if (res.error?.message?.includes("title_en")) {
    if (locale === "en") {
      prompts = [];
    } else {
      res = await attempt(LIST_SELECT_BASE_GEN);
      if (res.error?.message?.includes("generate_count")) {
        res = await attempt(LIST_SELECT_BASE);
      }
      prompts = (res.data as unknown as Row[] | null) ?? [];
    }
  } else if (res.error?.message?.includes("generate_count")) {
    res = await attempt(LIST_SELECT);
    if (res.error?.message?.includes("title_en")) {
      prompts = locale === "en" ? [] : ((await attempt(LIST_SELECT_BASE)).data as unknown as Row[] | null) ?? [];
    } else {
      prompts = (res.data as unknown as Row[] | null) ?? [];
    }
  } else {
    prompts = (res.data as unknown as Row[] | null) ?? [];
  }
  prompts = filterByLocale(prompts, locale) as Row[];
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const featured =
    page === 1 ? await getCachedCategoryFeatured(locale, slug) : [];

  function renderCard(p: Row | HomePromptRow, priority = false) {
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
        priority={priority}
        editorPick={Boolean(p.owner_pinned_at)}
        adminPinned={Boolean(p.admin_pin_global || p.admin_pin_category)}
      />
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6">
      <div className="space-y-2 border-b border-secondary/60 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          <CategoryIcon name={categoryIconName(slug)} size={28} className="shrink-0" />
          {categoryLabel(slug, locale)}
        </h1>
        <p className="text-ink-muted">
          {total} {t("categoryCount")}
        </p>
      </div>

      <div className="sticky top-14 z-30 -mx-3 sm:-mx-6">
        <CategoryChips activeSlug={slug} />
      </div>

      <div className="space-y-8 py-8">
        {featured.length > 0 ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  {t("categoryFeatured")}
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {t("categoryFeaturedSub")}
                </p>
              </div>
              <LocaleLink
                href="/editor-picks"
                className="text-sm font-semibold text-primary hover:underline"
              >
                {t("navEditorPicks")}
              </LocaleLink>
            </div>
            <div className="marketplace-grid">
              {featured.map((p, i) => renderCard(p, i < 2))}
            </div>
          </section>
        ) : null}

        <PaginationShell
          skeleton={<PromptGridSkeleton count={perPage} />}
          content={
            <>
              <section className="marketplace-grid">
                {prompts.map((p) => renderCard(p))}
              </section>

              {!prompts.length && (
                <p className="text-center text-ink-muted">
                  {t("emptyCategory")}
                </p>
              )}
            </>
          }
          controls={
            <PaginationControls
              basePath={`/category/${slug}`}
              page={page}
              perPage={perPage}
              total={total}
            />
          }
        />
      </div>
    </main>
  );
}
