import { notFound, redirect } from "next/navigation";
import { PromptEditorForm } from "@/components/PromptEditorForm";
import { createClient } from "@/lib/supabase/server";
import type { PromptFieldInput, PromptMode } from "@/lib/types";

export default async function ProfilePromptEditPage({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/auth?next=/profile/${username}/${id}/edit`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.username !== username) notFound();

  const { data: prompt } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();

  if (!prompt) notFound();

  const { data: fields } = await supabase
    .from("prompt_fields")
    .select("*")
    .eq("prompt_id", id)
    .order("sort_order");

  return (
    <main className="px-4 py-10">
      <PromptEditorForm
        authorUsername={profile.username}
        existing={{
          id: prompt.id,
          title: prompt.title,
          description: prompt.description,
          mode: prompt.mode as PromptMode,
          body: prompt.body,
          category: prompt.category,
          tags: prompt.tags,
          title_en: prompt.title_en ?? null,
          description_en: prompt.description_en ?? null,
          body_en: prompt.body_en ?? null,
          tags_en: prompt.tags_en ?? null,
          video_url: prompt.video_url,
          image_path: prompt.image_path,
          image_path_en: prompt.image_path_en ?? null,
          is_public: prompt.is_public,
          public_until: prompt.public_until,
          fields: (fields ?? []) as PromptFieldInput[],
        }}
      />
    </main>
  );
}
