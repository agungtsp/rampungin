import Link from "next/link";
import { notFound } from "next/navigation";
import { FollowButton } from "@/components/FollowButton";
import { PaginationControls } from "@/components/PaginationControls";
import { PromptCard } from "@/components/PromptCard";
import { SocialLinks } from "@/components/SocialLinks";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { username } = await params;
  const sp = await searchParams;
  const perPage = parsePageSize(sp.perPage);
  let page = parsePage(sp.page);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) notFound();

  const { from, to } = pageRange(page, perPage);
  type PRow = {
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
  };
  let prompts: PRow[] = [];
  let count: number | null = 0;
  {
    const first = await supabase
      .from("prompts")
      .select(
        "id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path",
        { count: "exact" },
      )
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (first.error?.message?.includes("generate_count")) {
      const second = await supabase
        .from("prompts")
        .select(
          "id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path",
          { count: "exact" },
        )
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false })
        .range(from, to);
      prompts = (second.data as PRow[] | null) ?? [];
      count = second.count;
    } else {
      prompts = (first.data as PRow[] | null) ?? [];
      count = first.count;
    }
  }

  const total = count ?? 0;
  page = clampPage(page, total, perPage);

  let initiallyFollowing = false;
  if (user && user.id !== profile.id) {
    const { data: follow } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .maybeSingle();
    initiallyFollowing = Boolean(follow);
  }

  const isSelf = user?.id === profile.id;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/[0.07] shadow-card">
        <div className="h-24 bg-gradient-to-r from-blue-900 via-accent to-sky-400 sm:h-28" />
        <div className="relative px-5 pb-6 pt-0 sm:px-8">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-accent font-display text-2xl font-bold text-white shadow-md">
                {(profile.display_name || profile.username)
                  .slice(0, 1)
                  .toUpperCase()}
              </div>
              <div className="pb-1">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {profile.display_name || profile.username}
                </h1>
                <p className="text-ink-muted">@{profile.username}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pb-1">
              {isSelf && (
                <Link
                  href="/me"
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/[0.1] transition hover:bg-background"
                >
                  Edit profil
                </Link>
              )}
              <FollowButton
                followingId={profile.id}
                initiallyFollowing={initiallyFollowing}
                isLoggedIn={Boolean(user)}
                isSelf={isSelf}
              />
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 max-w-2xl text-ink-muted">{profile.bio}</p>
          )}

          <div className="mt-4">
            <SocialLinks
              profile={{
                threads_url: profile.threads_url,
                instagram_url: profile.instagram_url,
                youtube_url: profile.youtube_url,
                linkedin_url: profile.linkedin_url,
              }}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Prompt publik
        </h2>
        <span className="text-sm text-ink-muted">{total} prompt</span>
      </div>

      <section className="marketplace-grid">
        {(prompts ?? []).map((p) => (
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
            authorUsername={profile.username}
            imageUrl={publicImageUrl(p.image_path)}
          />
        ))}
      </section>

      {!prompts?.length && (
        <p className="text-center text-blue-900/60">
          Belum ada prompt publik.
        </p>
      )}

      <PaginationControls
        basePath={`/profile/${username}`}
        page={page}
        perPage={perPage}
        total={total}
      />
    </main>
  );
}
