import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const FULL_SOFT_DELETE = {
  short_slug: null as null,
  is_public: false,
  public_until: null as null,
  owner_pinned_at: null as null,
  admin_pin_global: false,
  admin_pin_category: false,
  admin_pinned_at: null as null,
};

function softDeletePayload() {
  return {
    deleted_at: new Date().toISOString(),
    ...FULL_SOFT_DELETE,
  };
}

function minimalSoftDeletePayload() {
  return {
    deleted_at: new Date().toISOString(),
    is_public: false,
    public_until: null as null,
  };
}

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

  const owner = prompt.author_id === user.id;
  const admin = owner ? false : await isAdmin(supabase, user.id);
  if (!owner && !admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Owners update via RLS; admins soft-delete any prompt via service role.
  const client = admin ? createAdminClient() : supabase;
  let query = client.from("prompts").update(softDeletePayload()).eq("id", id);
  if (owner) {
    query = query.eq("author_id", user.id);
  }

  let { error } = await query;

  if (
    error &&
    /owner_pinned|admin_pin|short_slug|deleted_at|column/i.test(error.message)
  ) {
    let retry = client
      .from("prompts")
      .update(minimalSoftDeletePayload())
      .eq("id", id);
    if (owner) {
      retry = retry.eq("author_id", user.id);
    }
    ({ error } = await retry);
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
