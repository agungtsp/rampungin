import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Body = {
  scope?: "global" | "category";
  pinned?: boolean;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const scope = body.scope;
  const pinned = body.pinned;
  if (scope !== "global" && scope !== "category") {
    return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  }
  if (typeof pinned !== "boolean") {
    return NextResponse.json({ error: "Invalid pinned" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: prompt, error: fetchError } = await admin
    .from("prompts")
    .select("id, admin_pin_global, admin_pin_category")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextGlobal =
    scope === "global" ? pinned : Boolean(prompt.admin_pin_global);
  const nextCategory =
    scope === "category" ? pinned : Boolean(prompt.admin_pin_category);
  const either = nextGlobal || nextCategory;

  const { data: updated, error } = await admin
    .from("prompts")
    .update({
      admin_pin_global: nextGlobal,
      admin_pin_category: nextCategory,
      admin_pinned_at: either ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select("admin_pin_global, admin_pin_category, admin_pinned_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateTag("prompts", "max");
  return NextResponse.json({ ok: true, ...updated });
}
