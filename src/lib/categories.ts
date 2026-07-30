export type CategoryIconName =
  | "squares-four"
  | "megaphone"
  | "code"
  | "pencil-simple"
  | "palette"
  | "chart-line-up"
  | "graduation-cap"
  | "lightning"
  | "chart-bar"
  | "film-strip"
  | "puzzle-piece";

export type Category = {
  slug: string;
  label: string;
  labelEn: string;
  emoji: string; // keep for backwards compat; UI must not render emoji
  icon: CategoryIconName;
  /** Tailwind gradient stops for marketplace cover placeholders */
  cover: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: "marketing",
    label: "Marketing",
    labelEn: "Marketing",
    emoji: "📣",
    icon: "megaphone",
    cover: "from-[#312e81] via-[#4f46e5] to-[#67e8f9]",
  },
  {
    slug: "coding",
    label: "Coding & Dev",
    labelEn: "Coding & Dev",
    emoji: "💻",
    icon: "code",
    cover: "from-[#0f172a] via-[#3730a3] to-[#22d3ee]",
  },
  {
    slug: "menulis",
    label: "Menulis",
    labelEn: "Writing",
    emoji: "✍️",
    icon: "pencil-simple",
    cover: "from-[#4c1d95] via-[#6366f1] to-[#a5b4fc]",
  },
  {
    slug: "desain",
    label: "Desain",
    labelEn: "Design",
    emoji: "🎨",
    icon: "palette",
    cover: "from-[#581c87] via-[#7c3aed] to-[#c4b5fd]",
  },
  {
    slug: "bisnis",
    label: "Bisnis",
    labelEn: "Business",
    emoji: "📈",
    icon: "chart-line-up",
    cover: "from-[#134e4a] via-[#0d9488] to-[#5eead4]",
  },
  {
    slug: "edukasi",
    label: "Edukasi",
    labelEn: "Education",
    emoji: "🎓",
    icon: "graduation-cap",
    cover: "from-[#1e1b4b] via-[#4338ca] to-[#818cf8]",
  },
  {
    slug: "produktivitas",
    label: "Produktivitas",
    labelEn: "Productivity",
    emoji: "⚡",
    icon: "lightning",
    cover: "from-[#155e75] via-[#0891b2] to-[#67e8f9]",
  },
  {
    slug: "data",
    label: "Data & Analisis",
    labelEn: "Data & Analytics",
    emoji: "📊",
    icon: "chart-bar",
    cover: "from-[#164e63] via-[#0891b2] to-[#a5f3fc]",
  },
  {
    slug: "hiburan",
    label: "Hiburan",
    labelEn: "Entertainment",
    emoji: "🎬",
    icon: "film-strip",
    cover: "from-[#5b21b6] via-[#9333ea] to-[#f0abfc]",
  },
  {
    slug: "lainnya",
    label: "Lainnya",
    labelEn: "Other",
    emoji: "🧩",
    icon: "puzzle-piece",
    cover: "from-[#1e293b] via-[#475569] to-[#94a3b8]",
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

export function categoryIconName(
  slug: string | null | undefined,
): CategoryIconName {
  if (slug === "all" || slug === "") return "squares-four";
  if (!slug) return "puzzle-piece";
  return BY_SLUG.get(slug)?.icon ?? "puzzle-piece";
}

export function categoryCover(slug: string | null | undefined): string {
  if (!slug) return BY_SLUG.get("lainnya")!.cover;
  return BY_SLUG.get(slug)?.cover ?? BY_SLUG.get("lainnya")!.cover;
}

export function getCategory(slug: string | null | undefined): Category | null {
  if (!slug) return null;
  return BY_SLUG.get(slug) ?? null;
}
