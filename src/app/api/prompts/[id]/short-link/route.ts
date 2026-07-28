import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import {
  generateShortSlug,
  isValidShortSlug,
  normalizeShortSlug,
} from "@/lib/short-slug";
import { createClient } from "@/lib/supabase/server";
import { isEffectivelyPublic } from "@/lib/visibility";

type Body = { slug?: string | null };

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

  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    body = {};
  }

  const { data: prompt, error: fetchError } = await supabase
    .from("prompts")
    .select("id, author_id, is_public, public_until, short_slug, deleted_at")
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    if (/short_slug|deleted_at|column/i.test(fetchError.message)) {
      return NextResponse.json(
        {
          error:
            "Short links require migration 20260727120000_soft_delete_short_slug.sql",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: fetchError.message }, { status: 400 });
  }
  if (!prompt || prompt.deleted_at) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (prompt.author_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (!isEffectivelyPublic(prompt.is_public, prompt.public_until)) {
    return NextResponse.json(
      { error: "Short links are only available for public prompts" },
      { status: 400 },
    );
  }

  const custom =
    typeof body.slug === "string" ? normalizeShortSlug(body.slug) : "";
  let nextSlug = custom;

  if (nextSlug) {
    if (!isValidShortSlug(nextSlug)) {
      return NextResponse.json(
        {
          error:
            "Slug must be 3–48 characters: lowercase letters, numbers, and hyphens",
        },
        { status: 400 },
      );
    }
  } else if (prompt.short_slug) {
    return NextResponse.json({ ok: true, short_slug: prompt.short_slug });
  } else {
    nextSlug = generateShortSlug();
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate =
      attempt === 0 || custom ? nextSlug : generateShortSlug();
    const { data: updated, error } = await supabase
      .from("prompts")
      .update({ short_slug: candidate })
      .eq("id", id)
      .eq("author_id", user.id)
      .select("short_slug")
      .single();

    if (!error && updated?.short_slug) {
      revalidateTag("prompts", "max");
      return NextResponse.json({ ok: true, short_slug: updated.short_slug });
    }

    if (error && /unique|duplicate/i.test(error.message)) {
      if (custom) {
        return NextResponse.json(
          { error: "That short link is already taken" },
          { status: 409 },
        );
      }
      continue;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: "Could not allocate a short link. Try again." },
    { status: 500 },
  );
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
    .update({ short_slug: null })
    .eq("id", id)
    .eq("author_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  revalidateTag("prompts", "max");
  return NextResponse.json({ ok: true, short_slug: null });
}
