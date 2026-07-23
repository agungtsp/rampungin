import { notFound, redirect } from "next/navigation";
import { promptDetailPath } from "@/lib/paths";
import { asOne, PROMPT_AUTHOR } from "@/lib/relations";
import { createClient } from "@/lib/supabase/server";

/** Legacy /prompts/[id] → /profile/{username}/{id} */
export default async function LegacyPromptRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
  if (!author?.username) notFound();
  redirect(promptDetailPath(author.username, id));
}
