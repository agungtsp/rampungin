import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FollowButton } from "@/components/FollowButton";
import { LocaleLink } from "@/components/LocaleLink";
import { PaginationControls } from "@/components/PaginationControls";
import {
  PaginationShell,
  PromptGridSkeleton,
} from "@/components/PaginationShell";
import { PromptCard } from "@/components/PromptCard";
import { SocialLinks } from "@/components/SocialLinks";
import { filterByLocale, localizePrompt } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import {
  clampPage,
  pageRange,
  parsePage,
  parsePageSize,
} from "@/lib/pagination";
import { applyLocaleAvailabilityFilter } from "@/lib/prompt-select";
import { buildPageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl, resolveAvatarUrl } from "@/lib/storage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return buildPageMetadata({
      locale,
      barePath: `/profile/${username}`,
      title: `@${username}`,
      noIndex: true,
    });
  }

  const name = profile.display_name || profile.username;
  return buildPageMetadata({
    locale,
    barePath: `/profile/${profile.username}`,
    title: `${name} (@${profile.username})`,
    description:
      profile.bio?.slice(0, 160) ||
      (locale === "en"
        ? `AI prompts by @${profile.username} on Rampungin`
        : `Prompt AI dari @${profile.username} di Rampungin`),
    image: resolveAvatarUrl(profile.avatar_url),
    type: "profile",
  });
}

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
  const locale = await getServerLocale();
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

  let countQuery = supabase
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id);
  countQuery = applyLocaleAvailabilityFilter(countQuery, locale);
  const { count: rawCount, error: countError } = await countQuery;
  let total = rawCount ?? 0;
  if (countError?.message?.includes("title_en") && locale === "en") total = 0;
  page = clampPage(page, total, perPage);
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
  };
  let prompts: PRow[] = [];
  {
    const selectWith =
      "id, title, description, mode, category, like_count, copy_count, generate_count, is_public, public_until, image_path, body, title_en, description_en, body_en, tags, tags_en, image_path_en, rating_avg, rating_count, ai_platform";
    const selectBase =
      "id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, body, tags";
    let q = supabase
      .from("prompts")
      .select(selectWith)
      .eq("author_id", profile.id)
      .order("created_at", { ascending: false });
    q = applyLocaleAvailabilityFilter(q, locale);
    const first = await q.range(from, to);
    if (first.error?.message?.includes("title_en")) {
      if (locale === "en") {
        prompts = [];
      } else {
        const q2 = supabase
          .from("prompts")
          .select(selectBase)
          .eq("author_id", profile.id)
          .order("created_at", { ascending: false });
        const second = await q2.range(from, to);
        prompts = (second.data as PRow[] | null) ?? [];
      }
    } else if (first.error?.message?.includes("generate_count")) {
      let q2 = supabase
        .from("prompts")
        .select(
          "id, title, description, mode, category, like_count, copy_count, is_public, public_until, image_path, body, title_en, description_en, body_en, tags, tags_en, image_path_en, rating_avg, rating_count, ai_platform",
        )
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false });
      q2 = applyLocaleAvailabilityFilter(q2, locale);
      const second = await q2.range(from, to);
      if (second.error?.message?.includes("title_en")) {
        prompts =
          locale === "en"
            ? []
            : ((
                await supabase
                  .from("prompts")
                  .select(selectBase)
                  .eq("author_id", profile.id)
                  .order("created_at", { ascending: false })
                  .range(from, to)
              ).data as PRow[] | null) ?? [];
      } else {
        prompts = (second.data as PRow[] | null) ?? [];
      }
    } else {
      prompts = (first.data as PRow[] | null) ?? [];
    }
  }
  prompts = filterByLocale(prompts, locale);

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
  const avatarSrc = resolveAvatarUrl(profile.avatar_url);
  const displayName = profile.display_name || profile.username;

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <section className="overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-secondary/50">
        <div className="relative h-36 bg-gradient-to-br from-primary-hover via-primary to-secondary sm:h-44">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_45%),radial-gradient(circle_at_80%_0%,#DBEAFE,transparent_40%)]" />
        </div>
        <div className="relative px-5 pb-7 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-soft shadow-card-hover sm:h-32 sm:w-32">
                {avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    title={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary font-display text-4xl font-bold text-white">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 space-y-2 pb-1">
                <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {displayName}
                </h1>
                <p className="inline-flex items-center rounded-full bg-soft px-3 py-1 text-sm font-semibold text-primary-hover ring-1 ring-secondary/50">
                  @{profile.username}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pb-1">
              {isSelf && (
                <LocaleLink
                  href="/me"
                  className="rounded-full px-4 py-2 text-sm font-medium text-ink ring-1 ring-black/[0.1] transition hover:bg-soft"
                >
                  {locale === "en" ? "Edit profile" : "Edit profil"}
                </LocaleLink>
              )}
              <FollowButton
                followingId={profile.id}
                profileUsername={profile.username}
                initiallyFollowing={initiallyFollowing}
                isLoggedIn={Boolean(user)}
                isSelf={isSelf}
              />
            </div>
          </div>

          {profile.bio ? (
            <div className="mt-6 max-w-2xl rounded-2xl bg-soft/70 px-4 py-3 ring-1 ring-secondary/40">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-hover">
                {locale === "en" ? "About" : "Bio"}
              </p>
              <p className="mt-1 text-base leading-relaxed text-ink-muted">
                {profile.bio}
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-ink-faint">
              {locale === "en" ? "No bio yet." : "Belum ada bio."}
            </p>
          )}

          <div className="mt-5">
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
          {locale === "en" ? "Public prompts" : "Prompt publik"}
        </h2>
        <span className="text-sm text-ink-muted">
          {total} {locale === "en" ? "prompts" : "prompt"}
        </span>
      </div>

      <PaginationShell
        skeleton={<PromptGridSkeleton count={perPage} />}
        content={
          <>
            <section className="marketplace-grid">
              {(prompts ?? []).map((p) => {
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
                    authorUsername={profile.username}
                    imageUrl={publicImageUrl(loc.imagePath)}
                    rating_avg={p.rating_avg}
                    rating_count={p.rating_count}
                    ai_platform={p.ai_platform}
                    isLoggedIn={Boolean(user)}
                  />
                );
              })}
            </section>

            {!prompts?.length && (
              <p className="text-center text-ink/60">
                {locale === "en"
                  ? "No public prompts to show yet."
                  : "Belum ada prompt publik untuk ditampilkan."}
              </p>
            )}
          </>
        }
        controls={
          <PaginationControls
            basePath={`/profile/${username}`}
            page={page}
            perPage={perPage}
            total={total}
          />
        }
      />
    </main>
  );
}
