import { notFound, redirect } from "next/navigation";
import { promptEditPath } from "@/lib/paths";
import { createClient } from "@/lib/supabase/server";

/** Legacy /prompts/[id]/edit → /profile/{username}/{id}/edit */
export default async function LegacyPromptEditRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth?next=/prompts/${id}/edit`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  const { data: prompt } = await supabase
    .from("prompts")
    .select("id")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!prompt || !profile?.username) notFound();
  redirect(promptEditPath(profile.username, id));
}
