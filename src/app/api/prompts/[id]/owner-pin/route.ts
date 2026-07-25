import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { OWNER_PIN_LIMIT } from "@/lib/roles";
import { createClient } from "@/lib/supabase/server";
import { isEffectivelyPublic } from "@/lib/visibility";

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
    .select("id, author_id, is_public, public_until, owner_pinned_at")
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
  if (!isEffectivelyPublic(prompt.is_public, prompt.public_until)) {
    return NextResponse.json(
      { error: "Only public prompts can be pinned to Editor Picks" },
      { status: 400 },
    );
  }

  if (!prompt.owner_pinned_at) {
    const { count, error: countError } = await supabase
      .from("prompts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", user.id)
      .not("owner_pinned_at", "is", null);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }
    if ((count ?? 0) >= OWNER_PIN_LIMIT) {
      return NextResponse.json(
        {
          error: `Pin limit reached (max ${OWNER_PIN_LIMIT})`,
          code: "OWNER_PIN_LIMIT",
          limit: OWNER_PIN_LIMIT,
        },
        { status: 400 },
      );
    }
  }

  const { data: updated, error } = await supabase
    .from("prompts")
    .update({ owner_pinned_at: new Date().toISOString() })
    .eq("id", id)
    .eq("author_id", user.id)
    .select("owner_pinned_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateTag("prompts", "max");
  return NextResponse.json({ ok: true, owner_pinned_at: updated.owner_pinned_at });
}

export async function DELETE(
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

  const { error } = await supabase
    .from("prompts")
    .update({ owner_pinned_at: null })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateTag("prompts", "max");
  return NextResponse.json({ ok: true, owner_pinned_at: null });
}
