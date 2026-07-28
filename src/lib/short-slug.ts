const SLUG_RE = /^[a-z0-9]([a-z0-9-]{1,46}[a-z0-9])?$/;

/** Validate custom / auto short slug for /p/{slug}. */
export function isValidShortSlug(slug: string): boolean {
  return SLUG_RE.test(slug);
}

/** Normalize user input: trim, lowercase, collapse separators. */
export function normalizeShortSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Random URL-safe slug (8 chars). */
export function generateShortSlug(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) {
    out += alphabet[b % alphabet.length];
  }
  return out;
}

export function shortLinkPath(slug: string): string {
  return `/p/${encodeURIComponent(slug)}`;
}
