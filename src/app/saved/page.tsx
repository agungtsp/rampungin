import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getServerLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/paths";
import { noIndexMetadata } from "@/lib/seo";
import { SavedDashboard } from "./SavedDashboard";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return noIndexMetadata(
    locale,
    "/saved",
    locale === "en" ? "Saved prompts" : "Prompt tersimpan",
  );
}

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const locale = await getServerLocale();
    redirect(
      `${localePath(locale, "/auth")}?next=${encodeURIComponent(localePath(locale, "/saved"))}`,
    );
  }

  return <SavedDashboard />;
}
