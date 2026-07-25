export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/prompt-images/${path}`;
}

/** Avatar may be a full Google URL or a path in prompt-images. */
export function resolveAvatarUrl(
  avatarUrl: string | null | undefined,
): string | null {
  return publicImageUrl(avatarUrl);
}
