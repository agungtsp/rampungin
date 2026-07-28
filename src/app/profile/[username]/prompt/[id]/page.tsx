import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DisqusComments } from "@/components/DisqusComments";
import { MediaPreview } from "@/components/MediaPreview";
import { PromptForm } from "@/components/PromptForm";
import { PromptPinControls } from "@/components/PromptPinControls";
import { PromptUsageGuide } from "@/components/PromptUsageGuide";
import { ShortLinkControls } from "@/components/ShortLinkControls";
import { SaveToFolderButton } from "@/components/SaveToFolderButton";
import { SocialBar } from "@/components/SocialBar";
import { StarRating } from "@/components/StarRating";
import { aiPlatformBadge } from "@/lib/ai-platform";
import { categoryEmoji, categoryLabel } from "@/lib/categories";
import {
  isAvailableInLocale,
  localizePrompt,
} from "@/lib/i18n";
import { localePath } from "@/lib/i18n/paths";
import { getServerLocale } from "@/lib/i18n/server";
import { promptDetailPath, promptEditPath } from "@/lib/paths";
import { asOne, PROMPT_AUTHOR_FULL } from "@/lib/relations";
import { isAdmin } from "@/lib/roles";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";
import { isEffectivelyPublic } from "@/lib/visibility";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}): Promise<Metadata> {
  const { username, id } = await params;
  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: prompt } = await supabase
    .from("prompts")
    .select(
      `title, description, body, title_en, description_en, body_en, image_path, image_path_en, is_public, public_until, created_at, ${PROMPT_AUTHOR_FULL}`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!prompt) {
    return buildPageMetadata({
      locale,
      barePath: `/profile/${username}/prompt/${id}`,
      title: "Prompt",
      noIndex: true,
    });
  }

  const author = asOne(
    prompt.profiles as
      | { username: string; display_name: string | null }
      | { username: string; display_name: string | null }[]
      | null,
  );
  const localized = localizePrompt(
    {
      title: prompt.title,
      description: prompt.description,
      body: prompt.body ?? "",
      tags: null,
      image_path: prompt.image_path,
      title_en: prompt.title_en,
      description_en: prompt.description_en,
      body_en: prompt.body_en,
      tags_en: null,
      image_path_en: prompt.image_path_en,
    },
    locale,
  );
  const cover = publicImageUrl(localized.imagePath);
  const bare = promptDetailPath(author?.username || username, id);

  return buildPageMetadata({
    locale,
    barePath: bare,
    title: localized.title,
    description:
      localized.description?.slice(0, 160) ||
      (locale === "en"
        ? `Free AI prompt by @${author?.username || username} on Rampungin`
        : `Prompt AI gratis dari @${author?.username || username} di Rampungin`),
    image: cover,
    type: "article",
    publishedTime: prompt.created_at,
    noIndex: !isEffectivelyPublic(prompt.is_public, prompt.public_until),
  });
}

export default async function ProfilePromptDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string; id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { username, id } = await params;
  const sp = await searchParams;
  const locale = await getServerLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: prompt, error: promptError } = await supabase
    .from("prompts")
    .select(`*, ${PROMPT_AUTHOR_FULL}`)
    .eq("id", id)
    .maybeSingle();

  if (promptError) {
    console.error("prompt detail query failed:", promptError.message);
  }
  if (!prompt) notFound();

  const author = asOne(
    prompt.profiles as
      | { username: string; display_name: string | null }
      | { username: string; display_name: string | null }[]
      | null,
  );

  if (!author?.username || author.username !== username) {
    notFound();
  }

  const effectivelyPublic = isEffectivelyPublic(
    prompt.is_public,
    prompt.public_until,
  );
  const isOwner = user?.id === prompt.author_id;
  if (!effectivelyPublic && !isOwner) notFound();

  const viewerIsAdmin = user ? await isAdmin(supabase, user.id) : false;

  const { data: fields } = await supabase
    .from("prompt_fields")
    .select("*")
    .eq("prompt_id", id)
    .order("sort_order");

  let initialLiked = false;
  let initialUserStars: number | null = null;
  if (user) {
    const { data: like } = await supabase
      .from("likes")
      .select("prompt_id")
      .eq("prompt_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    initialLiked = Boolean(like);
    const { data: rating } = await supabase
      .from("prompt_ratings")
      .select("stars")
      .eq("prompt_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    initialUserStars =
      typeof rating?.stars === "number" ? rating.stars : null;
  }

  const detailPath = promptDetailPath(author.username, id);
  const pageAbsoluteUrl = absoluteUrl(localePath(locale, detailPath));
  const available = isAvailableInLocale(
    {
      title: prompt.title,
      description: prompt.description,
      body: prompt.body,
      tags: prompt.tags,
      title_en: prompt.title_en,
      description_en: prompt.description_en,
      body_en: prompt.body_en,
      tags_en: prompt.tags_en,
    },
    locale,
  );
  if (!available && !isOwner) notFound();

  const localized = localizePrompt(
    {
      title: prompt.title,
      description: prompt.description,
      body: prompt.body,
      tags: prompt.tags,
      image_path: prompt.image_path,
      title_en: prompt.title_en,
      description_en: prompt.description_en,
      body_en: prompt.body_en,
      tags_en: prompt.tags_en,
      image_path_en: prompt.image_path_en,
    },
    available ? locale : "id",
  );

  const modeLabel =
    prompt.mode === "template"
      ? locale === "en"
        ? "Template"
        : "Template"
      : locale === "en"
        ? "Ready to use"
        : "Siap pakai";

  const coverUrl = publicImageUrl(localized.imagePath);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: localized.title,
    description: localized.description,
    url: pageAbsoluteUrl,
    image: coverUrl || undefined,
    datePublished: prompt.created_at,
    dateModified: prompt.updated_at,
    inLanguage: available ? locale : "id",
    author: {
      "@type": "Person",
      name: author.display_name || author.username,
      url: absoluteUrl(localePath(locale, `/profile/${author.username}`)),
    },
    isAccessibleForFree: true,
    ...(Number(prompt.rating_count) > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(prompt.rating_avg) || 0,
            ratingCount: Number(prompt.rating_count) || 0,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {sp.notice === "i18n_migration" ? (
        <p
          role="status"
          className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-200"
        >
          {locale === "en"
            ? "Saved without English columns — run the prompt_i18n migration on Supabase to enable bilingual fields."
            : "Tersimpan tanpa kolom bahasa Inggris — jalankan migrasi prompt_i18n di Supabase untuk mengaktifkan field bilingual."}
        </p>
      ) : null}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {prompt.owner_pinned_at && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 font-semibold text-white shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-3.5 w-3.5 shrink-0"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
              {locale === "en" ? "Editor's Pick" : "Pilihan editor"}
            </span>
          )}
          <Link
            href={localePath(locale, `/category/${prompt.category ?? "lainnya"}`)}
            className="rounded-full bg-soft px-2.5 py-1 font-medium text-primary-hover transition hover:bg-primary/15"
          >
            {categoryEmoji(prompt.category)} {categoryLabel(prompt.category, locale)}
          </Link>
          <span className="rounded-full bg-soft px-2.5 py-1 font-medium text-ink-muted ring-1 ring-black/[0.06]">
            {modeLabel}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-primary-hover ring-1 ring-primary/20">
            {aiPlatformBadge(prompt.ai_platform)}
          </span>
          {prompt.public_until && effectivelyPublic && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900 ring-1 ring-amber-200/80">
              {locale === "en" ? "Public until" : "Publik sampai"}{" "}
              {new Date(prompt.public_until).toLocaleString(
                locale === "en" ? "en-US" : "id-ID",
              )}
            </span>
          )}
          {!effectivelyPublic && isOwner && (
            <span className="rounded-full bg-soft px-2.5 py-1 text-ink-muted">
              {locale === "en" ? "Private / expired" : "Privat / kedaluwarsa"}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {localized.title}
        </h1>
        {localized.description && (
          <p className="text-base leading-relaxed text-ink-muted">
            {localized.description}
          </p>
        )}
        <p className="text-sm text-ink-faint">
          {locale === "en" ? "by " : "oleh "}
          <Link
            href={localePath(locale, `/profile/${author.username}`)}
            className="font-medium text-primary hover:underline"
          >
            @{author.username}
          </Link>
          {isOwner && (
            <>
              {" · "}
              <Link
                href={localePath(locale, promptEditPath(author.username, id))}
                className="text-ink-muted hover:underline"
              >
                {locale === "en" ? "Edit" : "Edit"}
              </Link>
            </>
          )}
        </p>
      </div>

      <MediaPreview
        imageUrl={publicImageUrl(localized.imagePath)}
        videoUrl={prompt.video_url}
        category={prompt.category}
      />

      <div className="flex flex-wrap items-center gap-3">
        <StarRating
          promptId={prompt.id}
          promptPath={detailPath}
          initialAvg={Number(prompt.rating_avg) || 0}
          initialCount={Number(prompt.rating_count) || 0}
          initialUserStars={initialUserStars}
          isLoggedIn={Boolean(user)}
          canRate={effectivelyPublic}
        />
        <SaveToFolderButton
          promptId={prompt.id}
          promptPath={detailPath}
          isLoggedIn={Boolean(user)}
        />
      </div>

      {isOwner || viewerIsAdmin ? (
        <PromptPinControls
          promptId={prompt.id}
          category={prompt.category}
          isOwner={isOwner}
          isAdmin={viewerIsAdmin}
          isPublic={effectivelyPublic}
          initialOwnerPinned={Boolean(prompt.owner_pinned_at)}
          initialAdminPinGlobal={Boolean(prompt.admin_pin_global)}
          initialAdminPinCategory={Boolean(prompt.admin_pin_category)}
        />
      ) : null}

      {isOwner ? (
        <ShortLinkControls
          promptId={prompt.id}
          isPublic={effectivelyPublic}
          initialSlug={
            typeof prompt.short_slug === "string" ? prompt.short_slug : null
          }
        />
      ) : null}

      <PromptForm
        promptId={prompt.id}
        mode={prompt.mode}
        body={localized.body}
        fields={fields ?? []}
        isPublic={prompt.is_public}
        publicUntil={prompt.public_until}
        initialGenerateCount={
          typeof prompt.generate_count === "number" ? prompt.generate_count : 0
        }
        aiPlatform={prompt.ai_platform}
      />

      <PromptUsageGuide
        locale={available ? locale : "id"}
        aiPlatform={prompt.ai_platform}
        usageGuide={prompt.usage_guide}
        usageGuideEn={prompt.usage_guide_en}
      />

      <SocialBar
        promptId={prompt.id}
        promptPath={detailPath}
        title={localized.title}
        initialLiked={initialLiked}
        likeCount={prompt.like_count}
        canEngage={effectivelyPublic}
        isLoggedIn={Boolean(user)}
        showShare={effectivelyPublic}
      />

      {effectivelyPublic && (
        <DisqusComments
          identifier={prompt.id}
          url={pageAbsoluteUrl}
          title={localized.title}
        />
      )}
    </main>
  );
}
