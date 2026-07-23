"use client";

import { useState } from "react";
import { defaultCoverUrl } from "@/lib/cover";

type Props = {
  imageUrl?: string | null;
  videoUrl?: string | null;
  category?: string | null;
};

function youtubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function MediaPreview({ imageUrl, videoUrl, category }: Props) {
  const [videoFailed, setVideoFailed] = useState(false);
  const fallback = defaultCoverUrl(category);
  const [src, setSrc] = useState(imageUrl?.trim() || fallback);
  const embed = videoUrl ? youtubeEmbed(videoUrl) : null;

  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Preview hasil prompt"
        className="aspect-[16/10] w-full rounded-xl object-cover ring-1 ring-zinc-200 sm:aspect-video sm:max-h-96"
        onError={() => {
          if (src !== fallback) setSrc(fallback);
        }}
      />
      {videoUrl ? (
        <div className="rounded-xl bg-zinc-50 p-2 ring-1 ring-zinc-200">
          {embed && !videoFailed ? (
            <iframe
              src={embed}
              title="Preview video"
              className="aspect-video w-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onError={() => setVideoFailed(true)}
            />
          ) : (
            <div className="space-y-2 p-4 text-sm text-zinc-700">
              <p>Video tidak dapat diputar di sini.</p>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent underline"
              >
                Buka URL video
              </a>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
