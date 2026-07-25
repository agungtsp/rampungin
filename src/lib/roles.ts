import type { SupabaseClient } from "@supabase/supabase-js";

export const OWNER_PIN_LIMIT = 10;

export async function isAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data?.is_admin);
}
