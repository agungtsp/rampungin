import { PaginationControls } from "@/components/PaginationControls";
import { PromptCard } from "@/components/PromptCard";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import { asOne, PROMPT_AUTHOR } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";
import { trendingScore } from "@/lib/trending";

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
  const supabase = await createClient();

  let rows: Row[] = [];
  const withGen = await supabase
    .from("prompts")
    .select(
      `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, ${PROMPT_AUTHOR}`,
    )
    .limit(500);
  if (withGen.error?.message?.includes("generate_count")) {
    const fallback = await supabase
      .from("prompts")
      .select(
        `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, ${PROMPT_AUTHOR}`,
      )
      .limit(500);
    if (fallback.error) console.error("trending query failed:", fallback.error.message);
    rows = (fallback.data as Row[] | null) ?? [];
  } else {
    if (withGen.error) console.error("trending query failed:", withGen.error.message);
    rows = (withGen.data as Row[] | null) ?? [];
  }

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
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Trending
        </h1>
        <p className="text-zinc-500">
          Prompt paling ramai dipakai — skor dari suka, salin, dan generate.
        </p>
      </div>
      <section className="marketplace-grid">
        {pageItems.map((p) => {
          const author = asOne(p.profiles);
          return (
            <PromptCard
              key={p.id}
              id={p.id}
              title={p.title}
              description={p.description}
              mode={p.mode}
              category={p.category}
              like_count={p.like_count}
              copy_count={p.copy_count}
              generate_count={p.generate_count ?? 0}
              is_public={p.is_public}
              public_until={p.public_until}
              authorUsername={author?.username}
              imageUrl={publicImageUrl(p.image_path)}
            />
          );
        })}
      </section>
      <PaginationControls
        basePath="/trending"
        page={page}
        perPage={perPage}
        total={total}
      />
    </main>
  );
}
