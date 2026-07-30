"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { LocaleLink } from "./LocaleLink";
import { aiPlatformBadge } from "@/lib/ai-platform";
import { CategoryIcon } from "./CategoryIcon";
import { categoryIconName, categoryLabel } from "@/lib/categories";
import { defaultCoverUrl, promptCoverUrl } from "@/lib/cover";
import { useLocale } from "@/lib/i18n";
import { promptDetailPath } from "@/lib/paths";
import { isEffectivelyPublic } from "@/lib/visibility";

const SaveToFolderButton = dynamic(
  () =>
    import("./SaveToFolderButton").then((m) => ({
      default: m.SaveToFolderButton,
    })),
  { ssr: false, loading: () => null },
);

type Props = {
  id: string;
  title: string;
  description?: string | null;
  mode: string;
  category?: string | null;
  like_count: number;
  copy_count: number;
  generate_count?: number;
  is_public: boolean;
  public_until: string | null;
  authorUsername?: string | null;
  imageUrl?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  ai_platform?: string | null;
  isLoggedIn?: boolean;
  priority?: boolean;
  /** When set, show an Edit control (owner/manage views). */
  editHref?: string | null;
  editorPick?: boolean;
  adminPinned?: boolean;
  /** Extra controls under edit (e.g. owner pin on my-prompts). */
  manageControls?: ReactNode;
};

export function PromptCard({
  id,
  title,
  mode,
  category,
  like_count,
  copy_count,
  generate_count = 0,
  is_public,
  public_until,
  authorUsername,
  imageUrl,
  rating_avg = 0,
  rating_count = 0,
  ai_platform,
  isLoggedIn = false,
  priority = false,
  editHref = null,
  editorPick = false,
  adminPinned = false,
  manageControls = null,
}: Props) {
  const { locale, t } = useLocale();
  const pub = isEffectivelyPublic(is_public, public_until);
  const href = authorUsername
    ? promptDetailPath(authorUsername, id)
    : `/prompts/${id}`;
  const fallback = defaultCoverUrl(category);
  const [src, setSrc] = useState(() => promptCoverUrl(imageUrl, category));
  const [useFallbackImg, setUseFallbackImg] = useState(false);
  const avg = Number(rating_avg) || 0;
  const rcount = Number(rating_count) || 0;
  const isRemote = src.startsWith("http");
  const editLabel = t("edit");

  return (
    <div className="card-hover group relative min-w-0 h-full">
      <div className="absolute right-1.5 top-1.5 z-10 flex flex-col items-end gap-1 sm:right-2 sm:top-2">
        {editHref ? (
          <LocaleLink
            href={editHref}
            className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-ink shadow-sm ring-1 ring-black/10 transition hover:bg-soft sm:text-[11px]"
            title={editLabel}
            onClick={(e) => e.stopPropagation()}
          >
            {editLabel}
          </LocaleLink>
        ) : null}
        {manageControls}
        <SaveToFolderButton
          promptId={id}
          promptPath={href}
          isLoggedIn={isLoggedIn}
          compact
        />
      </div>
      <LocaleLink href={href} className="block h-full">
        <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-panel shadow-card ring-1 ring-secondary transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover">
          <div className="relative aspect-square shrink-0 overflow-hidden bg-soft">
            {isRemote && !useFallbackImg ? (
              <Image
                src={src}
                alt={title}
                title={title}
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                className="object-cover transition duration-500 group-hover:scale-[1.03]"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                loading={priority ? "eager" : "lazy"}
                quality={priority ? 75 : 70}
                onError={() => {
                  if (src !== fallback) {
                    setSrc(fallback);
                    setUseFallbackImg(true);
                  }
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={title}
                title={title}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                onError={() => {
                  if (src !== fallback) setSrc(fallback);
                }}
              />
            )}

            <div className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-3rem)] flex-wrap gap-1 sm:left-2 sm:top-2">
              {editorPick ? (
                <span className="flex items-center gap-1 rounded-md bg-accent-quiet px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:text-[11px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-3 w-3 shrink-0"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t("editorPickBadge")}
                </span>
              ) : null}
              {adminPinned ? (
                <span className="rounded-md bg-accent-quiet px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm sm:text-[11px]">
                  {t("adminPinnedBadge")}
                </span>
              ) : null}
              <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-panel/95 px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-sm backdrop-blur sm:text-[11px]">
                <CategoryIcon name={categoryIconName(category)} size={12} />
                <span className="hidden truncate sm:inline">
                  {categoryLabel(category, locale)}
                </span>
              </span>
              {mode === "template" ? (
                <span className="hidden rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm min-[400px]:inline sm:text-[11px]">
                  {t("templateBadge")}
                </span>
              ) : null}
              <span className="rounded-md bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:text-[11px]">
                {aiPlatformBadge(ai_platform)}
              </span>
            </div>

            {!pub ? (
              <span className="absolute bottom-1.5 left-1.5 rounded-md bg-primary-hover/85 px-1.5 py-0.5 text-[10px] font-medium text-white sm:bottom-2 sm:left-2">
                {t("private")}
              </span>
            ) : (
              <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:bottom-2 sm:right-2 sm:text-[10px]">
                {t("free")}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col space-y-1 p-2.5 sm:space-y-1.5 sm:p-3">
            <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-ink sm:min-h-[2.75rem] sm:text-sm">
              {title}
            </h3>
            <div className="mt-auto flex items-center justify-between gap-1.5 text-[10px] text-ink-faint sm:text-[11px]">
              <span className="min-w-0 truncate font-medium">
                {authorUsername ? `@${authorUsername}` : t("anonymous")}
              </span>
              <span className="shrink-0 tabular-nums">
                {rcount > 0 ? (
                  <>
                    ★ {avg.toFixed(1)}
                    <span className="mx-0.5 text-ink-faint sm:mx-1">·</span>
                  </>
                ) : null}
                ♥ {like_count}
                <span className="mx-0.5 text-ink-faint sm:mx-1">·</span>
                <span className="sm:hidden">{generate_count + copy_count}</span>
                <span className="hidden sm:inline">
                  {generate_count + copy_count} {t("used")}
                </span>
              </span>
            </div>
          </div>
        </article>
      </LocaleLink>
    </div>
  );
}
