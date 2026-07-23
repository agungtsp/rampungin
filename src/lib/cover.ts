/** Default marketplace cover when a prompt has no uploaded image. */
export function defaultCoverUrl(category?: string | null): string {
  const slug = category?.trim() || "lainnya";
  const known = new Set([
    "marketing",
    "coding",
    "menulis",
    "desain",
    "bisnis",
    "edukasi",
    "produktivitas",
    "data",
    "hiburan",
    "lainnya",
  ]);
  const key = known.has(slug) ? slug : "lainnya";
  return `/covers/${key}.svg`;
}

export function promptCoverUrl(
  imageUrl?: string | null,
  category?: string | null,
): string {
  return imageUrl?.trim() || defaultCoverUrl(category);
}
