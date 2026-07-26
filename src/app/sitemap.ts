import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getSiteUrl } from "@/lib/seo";
import { localePath } from "@/lib/i18n/paths";
import { createClient } from "@/lib/supabase/server";

const LOCALES = ["id", "en"] as const;

function parseDate(d?: string | null): Date {
  if (!d) return new Date();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function urlsFor(
  path: string,
  opts?: {
    changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority?: number;
    lastModified?: Date;
  },
) {
  const base = getSiteUrl();
  return LOCALES.map((locale) => ({
    url: `${base}${localePath(locale, path)}`,
    lastModified: opts?.lastModified ?? new Date(),
    changeFrequency: opts?.changeFrequency ?? "weekly",
    priority: opts?.priority ?? 0.6,
    alternates: {
      languages: {
        id: `${base}${localePath("id", path)}`,
        en: `${base}${localePath("en", path)}`,
        "x-default": `${base}${localePath("id", path)}`,
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    { path: "/", priority: 1, changeFrequency: "daily" as const },
    { path: "/trending", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/editor-picks", priority: 0.85, changeFrequency: "daily" as const },
    { path: "/people", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/tutorial", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const s of staticPaths) {
    entries.push(
      ...urlsFor(s.path, {
        priority: s.priority,
        changeFrequency: s.changeFrequency,
      }),
    );
  }

  for (const cat of CATEGORIES) {
    entries.push(
      ...urlsFor(`/category/${cat.slug}`, {
        priority: 0.7,
        changeFrequency: "daily",
      }),
    );
  }

  try {
    const supabase = await createClient();
    const { data: prompts } = await supabase
      .from("prompts")
      .select(
        "id, updated_at, is_public, public_until, profiles!prompts_author_id_fkey(username)",
      )
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(2000);

    for (const p of prompts ?? []) {
      const profiles = p.profiles as
        | { username: string }
        | { username: string }[]
        | null;
      const username = Array.isArray(profiles)
        ? profiles[0]?.username
        : profiles?.username;
      if (!username) continue;
      if (p.public_until && new Date(p.public_until) < new Date()) continue;
      const lastModified = parseDate(p.updated_at);
      entries.push(
        ...urlsFor(`/profile/${username}/prompt/${p.id}`, {
          priority: 0.8,
          changeFrequency: "weekly",
          lastModified,
        }),
      );
    }

    const { data: creators } = await supabase
      .from("profiles")
      .select("username, updated_at")
      .not("username", "is", null)
      .limit(500);

    for (const c of creators ?? []) {
      if (!c.username) continue;
      entries.push(
        ...urlsFor(`/profile/${c.username}`, {
          priority: 0.6,
          changeFrequency: "weekly",
          lastModified: parseDate(c.updated_at),
        }),
      );
    }
  } catch {
    // Sitemap still returns static routes if DB unavailable
  }

  return entries;
}

