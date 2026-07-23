import { PaginationControls } from "@/components/PaginationControls";
import { ProfileCard } from "@/components/ProfileCard";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";

function sanitizeQuery(raw: string): string {
  return raw.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; perPage?: string }>;
}) {
  const sp = await searchParams;
  const q = sanitizeQuery(sp.q ?? "");
  const perPage = parsePageSize(sp.perPage ?? "20");
  let page = parsePage(sp.page);
  const supabase = await createClient();

  const { from, to } = pageRange(page, perPage);
  let query = supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url", { count: "exact" })
    .order("username", { ascending: true })
    .range(from, to);

  if (q) {
    const pattern = `"%${q}%"`;
    query = query.or(
      `username.ilike.${pattern},display_name.ilike.${pattern},bio.ilike.${pattern}`,
    );
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("people search failed:", error.message);
  }

  const total = count ?? 0;
  page = clampPage(page, total, perPage);
  const profiles = data ?? [];

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-3 py-8 sm:px-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Cari profil
        </h1>
        <p className="text-zinc-500">
          Temukan kreator prompt lewat username, nama, atau bio.
        </p>
      </div>

      <form
        action="/people"
        method="get"
        className="flex flex-col gap-2 rounded-2xl bg-white p-3 ring-1 ring-zinc-200 sm:flex-row sm:items-center"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari @username, nama, atau kata di bio…"
          className="min-w-0 flex-1 rounded-xl bg-zinc-50 px-4 py-2.5 text-sm outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-accent/35"
        />
        {perPage !== 10 ? (
          <input type="hidden" name="perPage" value={perPage} />
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-ink"
        >
          Cari
        </button>
        {q ? (
          <a
            href="/people"
            className="rounded-full px-4 py-2.5 text-center text-sm font-medium text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
          >
            Reset
          </a>
        ) : null}
      </form>

      {q ? (
        <p className="text-sm text-zinc-500">
          Hasil untuk <span className="font-medium text-zinc-800">“{q}”</span>
        </p>
      ) : (
        <p className="text-sm text-zinc-500">Menampilkan semua profil</p>
      )}

      <section className="grid gap-3">
        {profiles.map((p) => (
          <ProfileCard
            key={p.id}
            username={p.username}
            displayName={p.display_name}
            bio={p.bio}
            avatarUrl={p.avatar_url}
          />
        ))}
      </section>

      {!profiles.length ? (
        <p className="py-10 text-center text-zinc-500">
          {error
            ? `Gagal memuat profil: ${error.message}`
            : q
              ? "Tidak ada profil yang cocok. Coba kata lain."
              : "Belum ada profil."}
        </p>
      ) : null}

      <PaginationControls
        basePath="/people"
        page={page}
        perPage={perPage}
        total={total}
        params={{ q: q || undefined }}
      />
    </main>
  );
}
