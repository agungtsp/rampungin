import { redirect } from "next/navigation";
import { MeDashboard } from "./MeDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=/me");

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
