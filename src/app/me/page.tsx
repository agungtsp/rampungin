import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MeDashboard } from "./MeDashboard";
import { getServerLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/paths";
import { noIndexMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return noIndexMetadata(
    locale,
    "/me",
    locale === "en" ? "My account" : "Akun saya",
  );
}

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getServerLocale();
    redirect(`${localePath(locale, "/auth")}?next=${encodeURIComponent(localePath(locale, "/me"))}`);
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: prompts } = await supabase
    .from("prompts")
    .select("id, title, is_public, public_until, mode")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <MeDashboard
      initialUsername={profile?.username ?? ""}
      initialDisplayName={profile?.display_name ?? ""}
      initialBio={profile?.bio ?? ""}
      initialAvatarUrl={profile?.avatar_url ?? null}
      initialSocials={{
        threads_url: profile?.threads_url ?? null,
        instagram_url: profile?.instagram_url ?? null,
        youtube_url: profile?.youtube_url ?? null,
        linkedin_url: profile?.linkedin_url ?? null,
      }}
      prompts={prompts ?? []}
    />
  );
}
