import { notFound } from "next/navigation";
import { CategoryChips } from "@/components/CategoryChips";
import { PaginationControls } from "@/components/PaginationControls";
import { PromptCard } from "@/components/PromptCard";
import {
  categoryEmoji,
  categoryLabel,
  isValidCategory,
} from "@/lib/categories";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import { asOne, PROMPT_AUTHOR } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";

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
  const supabase = await createClient();

  const { count: rawCount } = await supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("category", slug);
  const total = rawCount ?? 0;
  page = clampPage(page, total, perPage);
  const { from, to } = pageRange(page, perPage);

  const selectWithGen = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, ${PROMPT_AUTHOR}`;
  const selectBase = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, ${PROMPT_AUTHOR}`;

  let prompts: Array<{
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
    profiles: { username: string } | { username: string }[] | null;
  }> = [];

  {
    const first = await supabase
      .from("prompts")
      .select(selectWithGen)
      .eq("category", slug)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (first.error?.message?.includes("generate_count")) {
      const second = await supabase
        .from("prompts")
        .select(selectBase)
        .eq("category", slug)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (second.error) console.error("category query failed:", second.error.message);
      prompts = (second.data as unknown as typeof prompts) ?? [];
    } else {
      if (first.error) console.error("category query failed:", first.error.message);
      prompts = (first.data as unknown as typeof prompts) ?? [];
    }
  }

  const { data: catRows } = await supabase.from("prompts").select("category");
  const counts: Record<string, number> = {};
  for (const row of catRows ?? []) {
    const key = (row as { category: string | null }).category ?? "lainnya";
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6">
      <div className="space-y-2 border-b border-secondary/60 py-8">
        <h1 className="flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          <span>{categoryEmoji(slug)}</span>
          {categoryLabel(slug)}
        </h1>
        <p className="text-ink-muted">{total} prompt di kategori ini.</p>
      </div>

      <div className="sticky top-14 z-30 -mx-3 sm:-mx-6">
        <CategoryChips counts={counts} activeSlug={slug} />
      </div>

      <div className="space-y-8 py-8">
        <section className="marketplace-grid">
          {(prompts ?? []).map((p) => {
            const author = asOne(
              p.profiles as { username: string } | { username: string }[] | null,
            );
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

        {!prompts?.length && (
          <p className="text-center text-ink-muted">
            Belum ada prompt di kategori ini.
          </p>
        )}

        <PaginationControls
          basePath={`/category/${slug}`}
          page={page}
          perPage={perPage}
          total={total}
        />
      </div>
    </main>
  );
}
