export type Category = {
  slug: string;
  label: string;
  labelEn: string;
  emoji: string;
  /** Tailwind gradient stops for marketplace cover placeholders */
  cover: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "marketing",
    label: "Marketing",
    labelEn: "Marketing",
    emoji: "📣",
    cover: "from-[#1d4ed8] via-[#3b82f6] to-[#93c5fd]",
  },
  {
    slug: "coding",
    label: "Coding & Dev",
    labelEn: "Coding & Dev",
    emoji: "💻",
    cover: "from-[#0f172a] via-[#334155] to-[#22d3ee]",
  },
  {
    slug: "menulis",
    label: "Menulis",
    labelEn: "Writing",
    emoji: "✍️",
    cover: "from-[#7c2d12] via-[#ea580c] to-[#fdba74]",
  },
  {
    slug: "desain",
    label: "Desain",
    labelEn: "Design",
    emoji: "🎨",
    cover: "from-[#831843] via-[#db2777] to-[#f9a8d4]",
  },
  {
    slug: "bisnis",
    label: "Bisnis",
    labelEn: "Business",
    emoji: "📈",
    cover: "from-[#14532d] via-[#16a34a] to-[#86efac]",
  },
  {
    slug: "edukasi",
    label: "Edukasi",
    labelEn: "Education",
    emoji: "🎓",
    cover: "from-[#1e3a8a] via-[#6366f1] to-[#c4b5fd]",
  },
  {
    slug: "produktivitas",
    label: "Produktivitas",
    labelEn: "Productivity",
    emoji: "⚡",
    cover: "from-[#713f12] via-[#eab308] to-[#fde68a]",
  },
  {
    slug: "data",
    label: "Data & Analisis",
    labelEn: "Data & Analytics",
    emoji: "📊",
    cover: "from-[#164e63] via-[#0891b2] to-[#a5f3fc]",
  },
  {
    slug: "hiburan",
    label: "Hiburan",
    labelEn: "Entertainment",
    emoji: "🎬",
    cover: "from-[#4c1d95] via-[#7c3aed] to-[#e9d5ff]",
  },
  {
    slug: "lainnya",
    label: "Lainnya",
    labelEn: "Other",
    emoji: "🧩",
    cover: "from-[#27272a] via-[#52525b] to-[#d4d4d8]",
  },
];

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export const DEFAULT_CATEGORY = "lainnya";

export function isValidCategory(slug: string | null | undefined): boolean {
  return slug != null && BY_SLUG.has(slug);
}

export function categoryLabel(
  slug: string | null | undefined,
  locale: "id" | "en" = "id",
): string {
  if (!slug) return locale === "en" ? "Other" : "Lainnya";
  const c = BY_SLUG.get(slug);
  if (!c) return locale === "en" ? "Other" : "Lainnya";
  return locale === "en" ? c.labelEn : c.label;
}

export function categoryEmoji(slug: string | null | undefined): string {
  if (!slug) return "🧩";
  return BY_SLUG.get(slug)?.emoji ?? "🧩";
}

export function categoryCover(slug: string | null | undefined): string {
  if (!slug) return BY_SLUG.get("lainnya")!.cover;
  return BY_SLUG.get(slug)?.cover ?? BY_SLUG.get("lainnya")!.cover;
}

export function getCategory(slug: string | null | undefined): Category | null {
  if (!slug) return null;
  return BY_SLUG.get(slug) ?? null;
}
