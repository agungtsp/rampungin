import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PromptEditorForm } from "@/components/PromptEditorForm";
import { getServerLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/paths";
import { noIndexMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return noIndexMetadata(
    locale,
    "/prompts/new",
    locale === "en" ? "Create prompt" : "Buat prompt",
  );
}

export default async function NewPromptPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getServerLocale();
    redirect(
      `${localePath(locale, "/auth")}?next=${encodeURIComponent(localePath(locale, "/prompts/new"))}`,
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="px-4 py-10">
      <PromptEditorForm authorUsername={profile?.username ?? undefined} />
    </main>
  );
}
