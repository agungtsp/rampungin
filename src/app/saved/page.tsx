import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SavedDashboard } from "./SavedDashboard";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=/saved");

  return <SavedDashboard />;
}
