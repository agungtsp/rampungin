import { CATEGORIES } from "@/lib/categories";
import type { Category } from "@/lib/categories";

const STOPWORDS = new Set([
  "saya",
  "mau",
  "ingin",
  "buat",
  "membuat",
  "bikin",
  "untuk",
  "yang",
  "dengan",
  "dari",
  "dan",
  "atau",
  "ini",
  "itu",
  "ada",
  "juga",
  "lebih",
  "agar",
  "supaya",
  "tolong",
  "please",
  "a",
  "an",
  "the",
  "to",
  "for",
  "of",
  "in",
  "on",
  "my",
  "me",
  "need",
  "want",
  "make",
  "create",
  "how",
  "cara",
]);

/** Intent keywords → category boosts / extra search terms */
const INTENT_MAP: { match: RegExp; category?: string; terms: string[] }[] = [
  {
    match: /landing|funnel|copywriting|iklan|ads|campaign|seo|email marketing|retention|crm|gtm|pricing page/i,
    category: "marketing",
    terms: ["marketing", "conversion", "campaign", "copy"],
  },
  {
    match: /code|coding|api|debug|refactor|sql|architect|engineer|backend|frontend|incident|test|devex/i,
    category: "coding",
    terms: ["coding", "engineering", "api", "architecture"],
  },
  {
    match: /tulis|menulis|essay|artikel|pidato|newsletter|proposal|op-?ed|ghostwriter|dokumentasi|naskah/i,
    category: "menulis",
    terms: ["menulis", "editorial", "writing"],
  },
  {
    match: /desain|design|ux|ui|figma|branding|wireframe|a11y|accessibility|prototype|portfolio/i,
    category: "desain",
    terms: ["desain", "ux", "design"],
  },
  {
    match: /bisnis|business|strategy|strategi|pitch|investor|revenue|monetisasi|okrs?|roadmap bisnis/i,
    category: "bisnis",
    terms: ["bisnis", "strategy", "growth"],
  },
  {
    match: /edukasi|belajar|kursus|materi|kurikulum|mengajar|lesson|quiz|pelatihan/i,
    category: "edukasi",
    terms: ["edukasi", "learning", "materi"],
  },
  {
    match: /produktivitas|productivity|habit|fokus|todo|time management|pomodoro|workflow|notion/i,
    category: "produktivitas",
    terms: ["produktivitas", "productivity", "workflow"],
  },
  {
    match: /data|analis[ia]|dashboard|sql|metrik|kpi|insight|statistik|visualisasi|etl/i,
    category: "data",
    terms: ["data", "analisis", "metrics"],
  },
  {
    match: /hiburan|story|cerita|game|skenario|youtube|konten lucu|script video|naskah film/i,
    category: "hiburan",
    terms: ["hiburan", "story", "script"],
  },
];

export type SearchablePrompt = {
  id: string;
  title: string;
  description?: string | null;
  body?: string | null;
  category?: string | null;
  tags?: string[] | null;
};

export function tokenizeIntent(intent: string): string[] {
  return intent
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s#-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

export function expandSmartSearch(intent: string): {
  tokens: string[];
  preferredCategories: string[];
  extraTerms: string[];
} {
  const tokens = tokenizeIntent(intent);
  const preferredCategories: string[] = [];
  const extraTerms: string[] = [];

  for (const rule of INTENT_MAP) {
    if (rule.match.test(intent)) {
      if (rule.category) preferredCategories.push(rule.category);
      extraTerms.push(...rule.terms);
    }
  }

  // Also match category labels/slugs typed directly
  for (const c of CATEGORIES) {
    if (intent.toLowerCase().includes(c.slug) || intent.toLowerCase().includes(c.label.toLowerCase())) {
      preferredCategories.push(c.slug);
    }
  }

  return {
    tokens: [...new Set(tokens)],
    preferredCategories: [...new Set(preferredCategories)],
    extraTerms: [...new Set(extraTerms)],
  };
}

export function scorePromptAgainstIntent(
  prompt: SearchablePrompt,
  intent: string,
): number {
  const { tokens, preferredCategories, extraTerms } = expandSmartSearch(intent);
  if (!tokens.length && !preferredCategories.length) return 0;

  const hay = [
    prompt.title ?? "",
    prompt.description ?? "",
    prompt.body ?? "",
    prompt.category ?? "",
    ...(prompt.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += 3;
    if ((prompt.title ?? "").toLowerCase().includes(t)) score += 4;
    if ((prompt.tags ?? []).some((tag) => tag.toLowerCase().includes(t))) score += 2;
  }
  for (const t of extraTerms) {
    if (hay.includes(t)) score += 2;
  }
  if (prompt.category && preferredCategories.includes(prompt.category)) {
    score += 8;
  }

  // phrase boost: consecutive tokens in title/description
  const phrase = tokens.slice(0, 3).join(" ");
  if (phrase.length >= 4 && hay.includes(phrase)) score += 5;

  return score;
}

export function rankPromptsByIntent<T extends SearchablePrompt>(
  prompts: T[],
  intent: string,
): T[] {
  const q = intent.trim();
  if (!q) return prompts;

  const scored = [...prompts]
    .map((p) => ({ p, s: scorePromptAgainstIntent(p, q) }))
    .sort((a, b) => b.s - a.s);
  const positive = scored.filter((x) => x.s > 0).map((x) => x.p);
  // Keep DB candidates if intent scoring wiped everything (stopwords / short tokens).
  return positive.length ? positive : prompts;
}

/** Build a PostgREST `or` filter for candidate fetch (title/description/tags). */
export function buildOrIlikeFilter(intent: string): string | null {
  const { tokens, extraTerms, preferredCategories } = expandSmartSearch(intent);
  const terms = [...tokens, ...extraTerms].slice(0, 8);
  if (!terms.length && !preferredCategories.length) return null;

  const parts: string[] = [];
  for (const t of terms) {
    const safe = t.replace(/[%_,]/g, " ").trim();
    if (safe.length < 2) continue;
    parts.push(`title.ilike.%${safe}%`);
    parts.push(`description.ilike.%${safe}%`);
  }
  for (const c of preferredCategories) {
    parts.push(`category.eq.${c}`);
  }
  return parts.length ? parts.join(",") : null;
}

export function categoryFromIntent(intent: string): Category | null {
  const { preferredCategories } = expandSmartSearch(intent);
  const slug = preferredCategories[0];
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}
