import { PaginationControls } from "@/components/PaginationControls";
import {
  PaginationShell,
  ProfileListSkeleton,
} from "@/components/PaginationShell";
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

  let countQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (q) {
    const pattern = `"%${q}%"`;
    countQuery = countQuery.or(
      `username.ilike.${pattern},display_name.ilike.${pattern},bio.ilike.${pattern}`,
    );
  }
  const { count: rawCount, error: countError } = await countQuery;
  const total = rawCount ?? 0;
  page = clampPage(page, total, perPage);
  const { from, to } = pageRange(page, perPage);

  let query = supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url")
    .order("username", { ascending: true })
    .range(from, to);

  if (q) {
    const pattern = `"%${q}%"`;
    query = query.or(
      `username.ilike.${pattern},display_name.ilike.${pattern},bio.ilike.${pattern}`,
    );
  }

  const { data, error } = await query;
  if (error || countError) {
    console.error("people search failed:", (error ?? countError)?.message);
  }

  const profiles = data ?? [];
  const displayError = error ?? countError;
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-3 py-8 sm:px-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Cari kreator
        </h1>
        <p className="text-ink-muted">
          Temukan pembuat prompt lewat username, nama tampilan, atau bio.
        </p>
      </div>

      <form
        action="/people"
        method="get"
        className="flex flex-col gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/50 sm:flex-row sm:items-center"
      >
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Cari @username, nama, atau kata di bio…"
          className="min-w-0 flex-1 rounded-xl bg-soft px-4 py-2.5 text-sm outline-none ring-1 ring-secondary/50 focus:bg-white text-ink focus:ring-2 focus:ring-primary/35"
        />
        {perPage !== 10 ? (
          <input type="hidden" name="perPage" value={perPage} />
        ) : null}
        <button
          type="submit"
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Cari
        </button>
        {q ? (
          <a
            href="/people"
            className="rounded-full px-4 py-2.5 text-center text-sm font-medium text-ink-muted transition hover:bg-soft hover:text-ink"
          >
            Hapus filter
          </a>
        ) : null}
      </form>

      {q ? (
        <p className="text-sm text-ink-muted">
          Hasil untuk <span className="font-medium text-ink">“{q}”</span>
        </p>
      ) : (
        <p className="text-sm text-ink-muted">Menampilkan semua kreator</p>
      )}

      <PaginationShell
        skeleton={<ProfileListSkeleton count={Math.min(perPage, 8)} />}
        content={
          <>
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
              <p className="py-10 text-center text-ink-muted">
                {displayError
                  ? `Gagal memuat profil: ${displayError.message}`
                  : q
                    ? "Tidak ada kreator yang cocok. Coba kata kunci lain."
                    : "Belum ada profil yang tersedia."}
              </p>
            ) : null}
          </>
        }
        controls={
          <PaginationControls
            basePath="/people"
            page={page}
            perPage={perPage}
            total={total}
            params={{ q: q || undefined }}
          />
        }
      />
    </main>
  );
}
