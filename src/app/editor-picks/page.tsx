import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LocaleLink } from "@/components/LocaleLink";
import { PaginationControls } from "@/components/PaginationControls";
import {
  PaginationShell,
  PromptGridSkeleton,
} from "@/components/PaginationShell";
import { PromptCard } from "@/components/PromptCard";
import { getCachedEditorPicks, type HomePromptRow } from "@/lib/home-data";
import { localizePrompt, translate } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import { parsePage, parsePageSize } from "@/lib/pagination";
import { asOne } from "@/lib/relations";
import { buildPageMetadata } from "@/lib/seo";
import { publicImageUrl } from "@/lib/storage";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return buildPageMetadata({
    locale,
    barePath: "/editor-picks",
    title: locale === "en" ? "Editor Picks" : "Pilihan Editor",
    description:
      locale === "en"
        ? "Prompts pinned by their creators as Editor Picks on Rampungin."
        : "Prompt yang di-pin kreator sebagai Pilihan Editor di Rampungin.",
  });
}

async function hasSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  return jar.getAll().some((c) => c.name.includes("-auth-token"));
}

export default async function EditorPicksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const sp = await searchParams;
  const perPage = parsePageSize(sp.perPage ?? "20");
  const page = parsePage(sp.page);
  const locale = await getServerLocale();
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const isLoggedIn = await hasSessionCookie();

  const { rows, total, error, page: safePage } = await getCachedEditorPicks({
    locale,
    page,
    perPage,
  });

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6">
      <div className="space-y-2 border-b border-secondary/60 py-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {t("navEditorPicks")}
        </h1>
        <p className="max-w-2xl text-sm text-ink-muted sm:text-base">
          {t("editorPicksSub")}
        </p>
      </div>

      <div className="space-y-8 py-8">
        <PaginationShell
          skeleton={<PromptGridSkeleton count={perPage} />}
          content={
            <>
              <section className="marketplace-grid">
                {rows.map((p: HomePromptRow, index) => {
                  const author = asOne(p.profiles ?? null);
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
                      authorUsername={author?.username}
                      imageUrl={publicImageUrl(loc.imagePath)}
                      rating_avg={p.rating_avg}
                      rating_count={p.rating_count}
                      ai_platform={p.ai_platform}
                      isLoggedIn={isLoggedIn}
                      priority={index < 2}
                      editorPick
                      adminPinned={Boolean(p.admin_pin_global)}
                    />
                  );
                })}
              </section>

              {!rows.length ? (
                <p className="py-12 text-center text-ink-muted">
                  {error ? `${t("loadError")}: ${error}` : t("emptyEditorPicks")}
                </p>
              ) : null}
            </>
          }
          controls={
            <PaginationControls
              basePath="/editor-picks"
              page={safePage}
              perPage={perPage}
              total={total}
            />
          }
        />

        <p className="text-center text-sm text-ink-faint">
          <LocaleLink href="/" className="font-semibold text-primary hover:underline">
            {t("seeAll")}
          </LocaleLink>
        </p>
      </div>
    </main>
  );
}
