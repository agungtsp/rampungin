import { PaginationControls } from "@/components/PaginationControls";
import {
  PaginationShell,
  PromptGridSkeleton,
} from "@/components/PaginationShell";
import { PromptCard } from "@/components/PromptCard";
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
import { buildPageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";
import { trendingScore } from "@/lib/trending";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    locale,
    barePath: "/trending",
    title: locale === "en" ? "Trending prompts" : "Prompt trending",
    description:
      locale === "en"
        ? "Most used AI prompts on Rampungin — ranked by likes, copies, and generates."
        : "Prompt AI paling banyak digunakan di Rampungin — berdasarkan suka, salin, dan generate.",
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
  generate_count?: number | null;
  is_public: boolean;
  public_until: string | null;
  image_path: string | null;
  body?: string | null;
  title_en?: string | null;
  description_en?: string | null;
  body_en?: string | null;
  tags?: string[] | null;
  tags_en?: string[] | null;
  image_path_en?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  ai_platform?: string | null;
  owner_pinned_at?: string | null;
  admin_pin_global?: boolean | null;
  admin_pin_category?: boolean | null;
  profiles: { username: string } | { username: string }[] | null;
};

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const sp = await searchParams;
  const perPage = parsePageSize(sp.perPage);
  let page = parsePage(sp.page);
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLoggedIn = Boolean(user);

  const attempt = async (select: string) => {
    const q = supabase
      .from("prompts")
      .select(select)
      .order("like_count", { ascending: false })
      .order("copy_count", { ascending: false })
      .limit(120);
    return applyLocaleAvailabilityFilter(q, locale);
  };

  let res = await attempt(LIST_SELECT_WITH_GEN);
  if (selectMissingPinColumns(res.error?.message)) {
    res = await attempt(
      LIST_SELECT_WITH_GEN.replace(
        /, admin_pin_global, admin_pin_category, admin_pinned_at, owner_pinned_at/,
        "",
      ),
    );
  }
  let rows: Row[] = [];
  if (res.error?.message?.includes("title_en")) {
    if (locale === "en") {
      rows = [];
    } else {
      res = await attempt(LIST_SELECT_BASE_GEN);
      if (res.error?.message?.includes("generate_count")) {
        res = await attempt(LIST_SELECT_BASE);
      }
      rows = (res.data as unknown as Row[] | null) ?? [];
    }
  } else if (res.error?.message?.includes("generate_count")) {
    res = await attempt(LIST_SELECT);
    if (res.error?.message?.includes("title_en")) {
      rows =
        locale === "en"
          ? []
          : ((await attempt(LIST_SELECT_BASE)).data as unknown as Row[] | null) ??
            [];
    } else {
      rows = (res.data as unknown as Row[] | null) ?? [];
    }
  } else {
    rows = (res.data as unknown as Row[] | null) ?? [];
  }

  rows = filterByLocale(rows, locale) as Row[];
  const ranked = [...rows].sort(
    (a, b) =>
      trendingScore(b.like_count, b.copy_count, b.generate_count ?? 0) -
      trendingScore(a.like_count, a.copy_count, a.generate_count ?? 0),
  );

  const total = ranked.length;
  page = clampPage(page, total, perPage);
  const { from, to } = pageRange(page, perPage);
  const pageItems = ranked.slice(from, to + 1);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-3 py-8 sm:px-6">
      <div className="max-w-xl space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Trending
        </h1>
        <p className="text-ink-muted">
          {locale === "en"
            ? "Most used prompts — based on likes, copies, and generates."
            : "Prompt paling banyak digunakan — berdasarkan suka, salin, dan generate."}
        </p>
      </div>
      <PaginationShell
        skeleton={<PromptGridSkeleton count={perPage} />}
        content={
          <>
            <section className="marketplace-grid">
              {pageItems.map((p, index) => {
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
                    priority={index < 2}
                    editorPick={Boolean(p.owner_pinned_at)}
                    adminPinned={Boolean(p.admin_pin_global || p.admin_pin_category)}
                  />
                );
              })}
            </section>
            {!pageItems.length ? (
              <p className="py-12 text-center text-ink-muted">
                {locale === "en"
                  ? "No trending prompts yet."
                  : "Belum ada prompt trending."}
              </p>
            ) : null}
          </>
        }
        controls={
          <PaginationControls
            basePath="/trending"
            page={page}
            perPage={perPage}
            total={total}
          />
        }
      />
    </main>
  );
}
