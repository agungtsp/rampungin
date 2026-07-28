import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  _request: Request,
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

  const { data: prompt, error: fetchError } = await supabase
    .from("prompts")
    .select("id, author_id")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }
  if (!prompt) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (prompt.author_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fullPayload = {
    deleted_at: new Date().toISOString(),
    short_slug: null,
    is_public: false,
    public_until: null,
    owner_pinned_at: null,
    admin_pin_global: false,
    admin_pin_category: false,
    admin_pinned_at: null,
  };

  let { error } = await supabase
    .from("prompts")
    .update(fullPayload)
    .eq("id", id)
    .eq("author_id", user.id);

  if (error && /owner_pinned|admin_pin|short_slug|deleted_at|column/i.test(error.message)) {
    const minimal = {
      deleted_at: new Date().toISOString(),
      is_public: false,
      public_until: null,
    };
    ({ error } = await supabase
      .from("prompts")
      .update(minimal)
      .eq("id", id)
      .eq("author_id", user.id));
  }

  if (error) {
    if (/deleted_at|column/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "Soft delete requires migration 20260727120000_soft_delete_short_slug.sql",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateTag("prompts", "max");
  return NextResponse.json({ ok: true });
}
