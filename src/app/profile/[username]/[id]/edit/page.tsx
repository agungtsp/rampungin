import { notFound, redirect } from "next/navigation";
import { getServerLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/paths";
import { promptEditPath } from "@/lib/paths";
import { asOne, PROMPT_AUTHOR } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";

/** Legacy /profile/{username}/{id}/edit → /profile/{username}/prompt/{id}/edit */
export default async function LegacyProfilePromptEditRedirect({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;
  if (id === "prompt") notFound();

  const locale = await getServerLocale();
  const supabase = await createClient();
  const { data: prompt } = await supabase
    .from("prompts")
    .select(`id, ${PROMPT_AUTHOR}`)
    .eq("id", id)
    .maybeSingle();

  if (!prompt) notFound();
  const author = asOne(
    prompt.profiles as { username: string } | { username: string }[] | null,
  );
  if (!author?.username || author.username !== username) notFound();

  redirect(localePath(locale, promptEditPath(author.username, id)));
}
