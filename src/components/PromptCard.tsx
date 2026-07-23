"use client";

import Link from "next/link";
import { useState } from "react";
import { categoryEmoji, categoryLabel } from "@/lib/categories";
import { defaultCoverUrl, promptCoverUrl } from "@/lib/cover";
import { promptDetailPath } from "@/lib/paths";
import { isEffectivelyPublic } from "@/lib/visibility";

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
}: Props) {
  const pub = isEffectivelyPublic(is_public, public_until);
  const href = authorUsername
    ? promptDetailPath(authorUsername, id)
    : `/prompts/${id}`;
  const fallback = defaultCoverUrl(category);
  const [src, setSrc] = useState(() => promptCoverUrl(imageUrl, category));

  return (
    <Link href={href} className="card-hover group block min-w-0">
      <article className="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-black/[0.06] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover">
        <div className="relative aspect-square overflow-hidden bg-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            onError={() => {
              if (src !== fallback) setSrc(fallback);
            }}
          />

          <div className="absolute left-1.5 top-1.5 flex max-w-[calc(100%-0.75rem)] flex-wrap gap-1 sm:left-2 sm:top-2">
            <span className="max-w-full truncate rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-sm backdrop-blur sm:text-[11px]">
              <span className="sm:hidden">{categoryEmoji(category)}</span>
              <span className="hidden sm:inline">
                {categoryEmoji(category)} {categoryLabel(category)}
              </span>
            </span>
            {mode === "template" ? (
              <span className="hidden rounded-md bg-primary-hover/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur min-[400px]:inline sm:text-[11px]">
                Template
              </span>
            ) : null}
          </div>

          {!pub ? (
            <span className="absolute right-1.5 top-1.5 rounded-md bg-primary-hover/85 px-1.5 py-0.5 text-[10px] font-medium text-white sm:right-2 sm:top-2">
              Privat
            </span>
          ) : (
            <span className="absolute bottom-1.5 right-1.5 rounded-md bg-soft0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-sm sm:bottom-2 sm:right-2 sm:text-[10px]">
              Gratis
            </span>
          )}
        </div>

        <div className="space-y-1 p-2.5 sm:space-y-1.5 sm:p-3">
          <h3 className="line-clamp-2 min-h-[2.25rem] text-[13px] font-semibold leading-snug text-ink group-hover:text-primary-hover sm:min-h-[2.5rem] sm:text-sm">
            {title}
          </h3>
          <div className="flex items-center justify-between gap-1.5 text-[10px] text-ink-muted sm:text-[11px]">
            <span className="min-w-0 truncate font-medium">
              {authorUsername ? `@${authorUsername}` : "Anonim"}
            </span>
            <span className="shrink-0 tabular-nums">
              ♥ {like_count}
              <span className="mx-0.5 text-ink-faint sm:mx-1">·</span>
              <span className="sm:hidden">{generate_count + copy_count}</span>
              <span className="hidden sm:inline">
                {generate_count + copy_count} pakai
              </span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
