import { notFound, redirect } from "next/navigation";
import { getServerLocale } from "@/lib/i18n/server";
import { localePath } from "@/lib/i18n/paths";
import { promptDetailPath } from "@/lib/paths";
import { asOne, PROMPT_AUTHOR } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";

/**
 * Legacy /profile/{username}/{id} → /profile/{username}/prompt/{id}
 * (keeps old links / sitemap entries working)
 */
export default async function LegacyProfilePromptRedirect({
  params,
}: {
  params: Promise<{ username: string; id: string }>;
}) {
  const { username, id } = await params;

  // Avoid catching /profile/{username}/prompt as an id
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

  redirect(localePath(locale, promptDetailPath(author.username, id)));
}
