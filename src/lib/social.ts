export type SocialPlatform = "threads" | "instagram" | "youtube" | "linkedin";

export type SocialLinksData = {
  threads_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  linkedin_url?: string | null;
};

export const SOCIAL_PLATFORMS: {
  key: SocialPlatform;
  label: string;
  column: keyof SocialLinksData;
  placeholder: string;
  hostHint: string;
}[] = [
  {
    key: "threads",
    label: "Threads",
    column: "threads_url",
    placeholder: "https://www.threads.net/@username",
    hostHint: "threads.net",
  },
  {
    key: "instagram",
    label: "Instagram",
    column: "instagram_url",
    placeholder: "https://www.instagram.com/username",
    hostHint: "instagram.com",
  },
  {
    key: "youtube",
    label: "YouTube",
    column: "youtube_url",
    placeholder: "https://www.youtube.com/@channel",
    hostHint: "youtube.com",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    column: "linkedin_url",
    placeholder: "https://www.linkedin.com/in/username",
    hostHint: "linkedin.com",
  },
];

/** Normalize user input into an https URL, or empty string if blank. */
export function normalizeSocialUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, "")}`;
}

export function filledSocials(data: SocialLinksData) {
  return SOCIAL_PLATFORMS.filter((p) => {
    const v = data[p.column];
    return typeof v === "string" && v.trim().length > 0;
  }).map((p) => ({
    ...p,
    href: normalizeSocialUrl(data[p.column] as string),
  }));
}
