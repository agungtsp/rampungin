import { notFound } from "next/navigation";
import { CategoryChips } from "@/components/CategoryChips";
import { PaginationControls } from "@/components/PaginationControls";
import {
  PaginationShell,
  PromptGridSkeleton,
} from "@/components/PaginationShell";
import { PromptCard } from "@/components/PromptCard";
import {
  categoryEmoji,
  categoryLabel,
  isValidCategory,
} from "@/lib/categories";
import {
  filterByLocale,
  localizePrompt,
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
  applyLocaleAvailabilityFilter,
} from "@/lib/prompt-select";
import { asOne } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";

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

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6">
      <div className="space-y-2 border-b border-secondary/60 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          <span>{categoryEmoji(slug)}</span>
          {categoryLabel(slug)}
        </h1>
        <p className="text-ink-muted">{total} prompt dalam kategori ini.</p>
      </div>

      <div className="sticky top-14 z-30 -mx-3 sm:-mx-6">
        <CategoryChips activeSlug={slug} />
      </div>

      <div className="space-y-8 py-8">
        <PaginationShell
          skeleton={<PromptGridSkeleton count={perPage} />}
          content={
            <>
              <section className="marketplace-grid">
                {prompts.map((p) => {
                  const author = asOne(p.profiles);
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
              </section>

              {!prompts.length && (
                <p className="text-center text-ink-muted">
                  Belum ada prompt dalam kategori ini.
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
