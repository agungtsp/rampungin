import { notFound, redirect } from "next/navigation";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";
import { detectPreferredLocale, localePath } from "@/lib/i18n/paths";
import { promptDetailPath } from "@/lib/paths";
import { createPublicClient } from "@/lib/supabase/public";
import { isEffectivelyPublic } from "@/lib/visibility";
import { cookies } from "next/headers";
import { isValidShortSlug, normalizeShortSlug } from "@/lib/short-slug";

type Props = { params: Promise<{ slug: string }> };

export default async function ShortLinkPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = normalizeShortSlug(decodeURIComponent(raw));
  if (!slug || !isValidShortSlug(slug)) notFound();

  const supabase = createPublicClient();
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select(
      "id, is_public, public_until, deleted_at, profiles!prompts_author_id_fkey(username)",
    )
    .eq("short_slug", slug)
    .maybeSingle();

  if (error || !prompt || prompt.deleted_at) notFound();
  if (!isEffectivelyPublic(prompt.is_public, prompt.public_until)) notFound();

  const profiles = prompt.profiles as
    | { username: string }
    | { username: string }[]
    | null;
  const username = Array.isArray(profiles)
    ? profiles[0]?.username
    : profiles?.username;
  if (!username) notFound();

  const jar = await cookies();
  const locale = detectPreferredLocale(jar.get(LOCALE_COOKIE)?.value);
  redirect(
    localePath(locale, promptDetailPath(username, prompt.id)),
  );
}
