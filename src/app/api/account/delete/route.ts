import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const { data: files } = await admin.storage
      .from("prompt-images")
      .list(user.id, { limit: 1000 });

    if (files?.length) {
      await admin.storage
        .from("prompt-images")
        .remove(files.map((f) => `${user.id}/${f.name}`));
    }

    // Delete auth user first. profiles (and dependents) cascade via FK.
    // Never delete profile before auth — a failed deleteUser would orphan the login.
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 },
    );
  }
}
