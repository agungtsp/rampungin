import { redirect } from "next/navigation";
import { PromptEditorForm } from "@/components/PromptEditorForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewPromptPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=/prompts/new");

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
