import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LocaleLink } from "@/components/LocaleLink";
import { PromptCard } from "@/components/PromptCard";
import { localizePrompt, translate } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/paths";
import { promptEditPath } from "@/lib/paths";
import {
  LIST_SELECT,
  LIST_SELECT_BASE,
  LIST_SELECT_BASE_GEN,
  LIST_SELECT_WITH_GEN,
} from "@/lib/prompt-select";
import { noIndexMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/storage";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return noIndexMetadata(
    locale,
    "/my-prompts",
    locale === "en" ? "My prompts" : "Prompt saya",
  );
}

type PromptRow = {
  id: string;
  title: string;
  description: string | null;
  mode: string;
  category: string | null;
  like_count: number;
  copy_count: number;
  generate_count?: number | null;
  is_public: boolean;
  public_until: string | null;
  image_path: string | null;
  body?: string | null;
  tags?: string[] | null;
  title_en?: string | null;
  description_en?: string | null;
  body_en?: string | null;
  tags_en?: string[] | null;
  image_path_en?: string | null;
  rating_avg?: number | null;
  rating_count?: number | null;
  ai_platform?: string | null;
};

export default async function MyPromptsPage() {
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `${localePath(locale, "/auth")}?next=${encodeURIComponent(localePath(locale, "/my-prompts"))}`,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();
  const username = profile?.username ?? null;

  const attempt = async (select: string) =>
    supabase
      .from("prompts")
      .select(select)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false });

  let res = await attempt(LIST_SELECT_WITH_GEN);
  if (res.error?.message?.includes("title_en")) {
    res = await attempt(LIST_SELECT_BASE_GEN);
  }
  if (res.error?.message?.includes("generate_count")) {
    res = await attempt(
      res.error?.message?.includes("title_en") ? LIST_SELECT_BASE : LIST_SELECT,
    );
    if (res.error?.message?.includes("title_en")) {
      res = await attempt(LIST_SELECT_BASE);
    }
  }

  const prompts = (res.data as unknown as PromptRow[] | null) ?? [];
  const loadError = res.error?.message ?? null;

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-secondary/60 py-8">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t("myPrompts")}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {locale === "en"
              ? "Manage prompts you have created."
              : "Kelola prompt yang kamu buat."}
          </p>
        </div>
        <LocaleLink
          href="/prompts/new"
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          {t("createNew")}
        </LocaleLink>
      </div>

      <div className="space-y-8 py-8">
        {prompts.length > 0 ? (
          <section className="marketplace-grid">
            {prompts.map((p, index) => {
              const loc = localizePrompt(
                {
                  title: p.title,
                  description: p.description,
                  body: p.body ?? "",
                  tags: p.tags ?? null,
                  image_path: p.image_path,
                  title_en: p.title_en,
                  description_en: p.description_en,
                  body_en: p.body_en,
                  tags_en: p.tags_en,
                  image_path_en: p.image_path_en,
                },
                locale,
              );
              return (
                <PromptCard
                  key={p.id}
                  id={p.id}
                  title={loc.title}
                  description={loc.description}
                  mode={p.mode}
                  category={p.category}
                  like_count={p.like_count}
                  copy_count={p.copy_count}
                  generate_count={p.generate_count ?? 0}
                  is_public={p.is_public}
                  public_until={p.public_until}
                  authorUsername={username}
                  imageUrl={publicImageUrl(loc.imagePath)}
                  rating_avg={p.rating_avg}
                  rating_count={p.rating_count}
                  ai_platform={p.ai_platform}
                  isLoggedIn
                  priority={index < 4}
                  editHref={
                    username ? promptEditPath(username, p.id) : `/prompts/${p.id}/edit`
                  }
                />
              );
            })}
          </section>
        ) : (
          <p className="py-12 text-center text-ink-muted">
            {loadError
              ? `${t("loadError")}: ${loadError}`
              : locale === "en"
                ? "You have not created any prompts yet."
                : "Belum ada prompt yang kamu buat."}{" "}
            {!loadError ? (
              <LocaleLink
                href="/prompts/new"
                className="font-semibold text-primary hover:underline"
              >
                {t("createNew")}
              </LocaleLink>
            ) : null}
          </p>
        )}
      </div>
    </main>
  );
}
