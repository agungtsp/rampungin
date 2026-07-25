import Link from "next/link";
import { notFound } from "next/navigation";
import { DisqusComments } from "@/components/DisqusComments";
import { MediaPreview } from "@/components/MediaPreview";
import { PromptForm } from "@/components/PromptForm";
import { PromptUsageGuide } from "@/components/PromptUsageGuide";
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
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";
import { isEffectivelyPublic } from "@/lib/visibility";

export default async function ProfilePromptDetailPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "";
  const absoluteUrl = siteUrl ? `${siteUrl}${detailPath}` : detailPath;

  const locale = await getServerLocale();
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

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href={localePath(locale, `/category/${prompt.category ?? "lainnya"}`)}
            className="rounded-full bg-soft px-2.5 py-1 font-medium text-primary-hover transition hover:bg-primary/15"
          >
            {categoryEmoji(prompt.category)} {categoryLabel(prompt.category)}
          </Link>
          <span className="rounded-full bg-soft px-2.5 py-1 font-medium text-ink-muted ring-1 ring-black/[0.06]">
            {modeLabel}
          </span>
          <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-primary-hover ring-1 ring-primary/20">
            {aiPlatformBadge(prompt.ai_platform)}
          </span>
          {prompt.public_until && effectivelyPublic && (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-900 ring-1 ring-amber-200/80">
              Publik sampai{" "}
              {new Date(prompt.public_until).toLocaleString("id-ID")}
            </span>
          )}
          {!effectivelyPublic && isOwner && (
            <span className="rounded-full bg-soft px-2.5 py-1 text-ink-muted">
              Privat / kedaluwarsa
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
                Edit
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
          url={absoluteUrl}
          title={localized.title}
        />
      )}
    </main>
  );
}
