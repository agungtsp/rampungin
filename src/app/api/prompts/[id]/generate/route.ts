import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isEffectivelyPublic } from "@/lib/visibility";

async function incrementViaAdmin(id: string): Promise<string | null> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("prompts")
      .select("generate_count, is_public, public_until")
      .eq("id", id)
      .maybeSingle();
    if (error) return error.message;
    if (!data) return "Prompt not found";
    if (!isEffectivelyPublic(data.is_public, data.public_until)) {
      return null; // same as RPC: no-op for private
    }
    const next = (data.generate_count ?? 0) + 1;
    const { error: upErr } = await admin
      .from("prompts")
      .update({ generate_count: next })
      .eq("id", id);
    return upErr?.message ?? null;
  } catch (e) {
    return e instanceof Error ? e.message : "Admin increment failed";
  }
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_generate_count", {
    p_id: id,
  });

  if (!error) {
    return NextResponse.json({ ok: true });
  }

  const missingFn =
    /Could not find the function|schema cache|does not exist/i.test(
      error.message,
    );

  if (missingFn) {
    // Migration not applied yet — fall back via service role, or soft-ok
    const fallbackErr = await incrementViaAdmin(id);
    if (!fallbackErr) {
      return NextResponse.json({
        ok: true,
        warning:
          "increment_generate_count RPC missing; used admin fallback. Run supabase/migrations/20260723140000_generate_count.sql",
      });
    }
    // Column might also be missing — don't break "Hasilkan" UX
    if (/generate_count|column/i.test(fallbackErr)) {
      return NextResponse.json({
        ok: true,
        warning: fallbackErr,
      });
    }
    return NextResponse.json({ error: fallbackErr }, { status: 400 });
  }

  return NextResponse.json({ error: error.message }, { status: 400 });
}
