import Link from "next/link";
import { CategoryChips } from "@/components/CategoryChips";
import { PaginationControls } from "@/components/PaginationControls";
import { PromptCard } from "@/components/PromptCard";
import { SmartSearchResultsBar } from "@/components/SmartSearchResultsBar";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import { asOne, PROMPT_AUTHOR } from "@/lib/relations";
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
  profiles?: { username: string } | { username: string }[] | null;
};

const LIST_SELECT = `id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, tags, body, ${PROMPT_AUTHOR}`;
const LIST_SELECT_WITH_GEN = `id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, tags, body, ${PROMPT_AUTHOR}`;

function CardGrid({ items }: { items: PromptRow[] }) {
  return (
    <div className="marketplace-grid">
      {items.map((p) => {
        const author = asOne(p.profiles ?? null);
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
  const supabase = await createClient();

  const { data: catRows } = await supabase.from("prompts").select("category");
  const counts: Record<string, number> = {};
  for (const row of catRows ?? []) {
    const key = (row as { category: string | null }).category ?? "lainnya";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const totalCatalog = Object.values(counts).reduce((a, b) => a + b, 0);

  const intentCategory = q ? categoryFromIntent(q) : null;
  let prompts: PromptRow[] = [];
  let featured: PromptRow[] = [];
  let total = 0;
  let promptsError: string | null = null;
  let smartNote: string | null = null;

  if (q) {
    const { rows, error } = await fetchCandidates(supabase, q, tag);
    if (error) promptsError = error;
    const ranked = rankPromptsByIntent(rows, q);
    total = ranked.length;
    page = clampPage(page, total, perPage);
    const { from, to } = pageRange(page, perPage);
    prompts = ranked.slice(from, to + 1);
    if (intentCategory) {
      smartNote = `Konteks terdeteksi: ${intentCategory.label} — diurutkan menurut relevansi.`;
    } else if (ranked.length) {
      smartNote = "Diurutkan menurut kecocokan dengan konteksmu.";
    }
  } else {
    const result = await listPage(supabase, { tag, page, perPage });
    prompts = result.rows;
    total = result.total;
    page = result.page;
    promptsError = result.error;

    if (page === 1 && !tag) {
      featured = await fetchFeatured(supabase);
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
              Gratis selamanya · {totalCatalog}+ prompt
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-[1.1]">
              Prompt Marketplace
            </h1>
            <p className="mx-auto mt-3 max-w-xl px-1 text-sm text-ink-muted sm:text-lg">
              Temukan prompt AI siap pakai dari komunitas. Isi parameter, salin,
              dan langsung dipakai.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
              <Link
                href="/prompts/new"
                className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover sm:px-5"
              >
                Jual / share promptmu
              </Link>
              <Link
                href="/trending"
                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-ink ring-1 ring-secondary/50 transition hover:bg-soft sm:px-5"
              >
                Lihat yang lagi tren
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <div className="sticky top-14 z-30 -mx-3 sm:-mx-6">
        <CategoryChips counts={counts} />
      </div>

      <div className="space-y-10 py-8">
        {q ? <SmartSearchResultsBar note={smartNote} query={q} /> : null}

        {!q && featured.length > 0 ? (
          <section className="space-y-4 animate-fade-up">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  Featured
                </h2>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Prompt paling disukai komunitas
                </p>
              </div>
              <Link
                href="/trending"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Explore all
              </Link>
            </div>
            <CardGrid items={featured} />
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {q ? "Hasil pencarian" : "Terbaru"}
              </h2>
              {!q ? (
                <p className="mt-0.5 text-sm text-ink-muted">
                  Prompt yang baru di-share
                </p>
              ) : null}
            </div>
            {!q ? (
              <Link
                href="/trending"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Trending
              </Link>
            ) : null}
          </div>
          <CardGrid items={prompts} />
        </section>

        {!prompts.length ? (
          <p className="py-12 text-center text-ink-muted">
            {promptsError
              ? `Gagal memuat prompt: ${promptsError}`
              : q
                ? "Tidak ada yang cocok. Coba konteks lain lewat kotak cari."
                : "Belum ada prompt publik. Jadilah yang pertama!"}
          </p>
        ) : null}

        <PaginationControls
          basePath="/"
          page={page}
          perPage={perPage}
          total={total}
          params={keep}
        />
      </div>
    </main>
  );
}

async function listPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  opts: { tag: string; page: number; perPage: number },
): Promise<{ rows: PromptRow[]; total: number; error: string | null; page: number }> {
  let countQuery = supabase
    .from("prompts")
    .select("id", { count: "exact", head: true });
  if (opts.tag) countQuery = countQuery.contains("tags", [opts.tag]);
  const { count, error: countError } = await countQuery;
  const total = count ?? 0;
  const page = clampPage(opts.page, total, opts.perPage);
  const { from, to } = pageRange(page, opts.perPage);

  const attempt = async (select: string) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .order("created_at", { ascending: false });
    if (opts.tag) query = query.contains("tags", [opts.tag]);
    return query.range(from, to);
  };

  let res = await attempt(LIST_SELECT_WITH_GEN);
  if (res.error?.message?.includes("generate_count")) {
    res = await attempt(LIST_SELECT);
  }
  return {
    rows: (res.data as unknown as PromptRow[] | null) ?? [],
    total,
    error: res.error?.message ?? countError?.message ?? null,
    page,
  };
}

async function fetchFeatured(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<PromptRow[]> {
  const attempt = async (select: string) =>
    supabase
      .from("prompts")
      .select(select)
      .order("like_count", { ascending: false })
      .order("copy_count", { ascending: false })
      .limit(10);

  let res = await attempt(LIST_SELECT_WITH_GEN);
  if (res.error?.message?.includes("generate_count")) {
    res = await attempt(LIST_SELECT);
  }
  return (res.data as unknown as PromptRow[] | null) ?? [];
}

async function fetchCandidates(
  supabase: Awaited<ReturnType<typeof createClient>>,
  intent: string,
  tag: string,
): Promise<{ rows: PromptRow[]; error: string | null }> {
  const orFilter = buildOrIlikeFilter(intent);
  const run = async (select: string) => {
    let query = supabase
      .from("prompts")
      .select(select)
      .order("created_at", { ascending: false })
      .limit(240);
    if (tag) query = query.contains("tags", [tag]);
    if (orFilter) query = query.or(orFilter);
    return query;
  };

  let res = await run(LIST_SELECT_WITH_GEN);
  if (res.error?.message?.includes("generate_count")) {
    res = await run(LIST_SELECT);
  }
  if (res.error) {
    const fb = await supabase
      .from("prompts")
      .select(LIST_SELECT)
      .ilike("title", `%${intent.slice(0, 80)}%`)
      .limit(120);
    return {
      rows: (fb.data as unknown as PromptRow[] | null) ?? [],
      error: res.error.message,
    };
  }
  return { rows: (res.data as unknown as PromptRow[] | null) ?? [], error: null };
}
