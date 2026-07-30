import { createHash } from "crypto";
import { NextResponse } from "next/server";
import {
  isValidPhone,
  normalizePhone,
  whatsAppLink,
} from "@/lib/labs-phone";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendTelegramMessage } from "@/lib/telegram";

const AUDIENCES = new Set([
  "daily",
  "family",
  "friends",
  "business",
  "school",
  "mix",
]);
const TIME_SPENT = new Set(["under_2h", "2_5h", "5_10h", "10_plus"]);
const EXPECTATIONS = new Set([
  "playbook",
  "drafting",
  "shared_workflow",
  "prioritize",
  "exploring",
]);

const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  audience?: string;
  problem?: string;
  repeatingTasks?: string;
  timeSpent?: string;
  expectations?: string[];
  notes?: string;
  locale?: string;
};

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function siteBase(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phoneRaw = String(body.phone ?? "").trim();
  const audience = String(body.audience ?? "").trim();
  const problem = String(body.problem ?? "").trim();
  const repeatingTasks = String(body.repeatingTasks ?? "").trim();
  const timeSpent = String(body.timeSpent ?? "").trim();
  const notes = String(body.notes ?? "").trim() || null;
  const locale = body.locale === "id" ? "id" : "en";
  const expectations = Array.isArray(body.expectations)
    ? [...new Set(body.expectations.map((e) => String(e).trim()))].filter(
        (e) => EXPECTATIONS.has(e),
      )
    : [];

  if (!name || name.length > 120) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!isValidPhone(phoneRaw)) {
    return NextResponse.json(
      { error: "Valid WhatsApp number is required" },
      { status: 400 },
    );
  }
  if (!AUDIENCES.has(audience)) {
    return NextResponse.json({ error: "Audience is required" }, { status: 400 });
  }
  if (!problem || problem.length > 5000) {
    return NextResponse.json({ error: "Problem is required" }, { status: 400 });
  }
  if (!repeatingTasks || repeatingTasks.length > 5000) {
    return NextResponse.json(
      { error: "Repeating tasks are required" },
      { status: 400 },
    );
  }
  if (!TIME_SPENT.has(timeSpent)) {
    return NextResponse.json({ error: "Time spent is required" }, { status: 400 });
  }
  if (expectations.length < 1) {
    return NextResponse.json(
      { error: "Pick at least one expectation" },
      { status: 400 },
    );
  }
  if (notes && notes.length > 5000) {
    return NextResponse.json({ error: "Notes too long" }, { status: 400 });
  }

  const phone = normalizePhone(phoneRaw);
  const ip = clientIp(request);
  const ipHash = hashIp(ip);

  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server misconfigured" },
      { status: 500 },
    );
  }

  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count } = await admin
    .from("labs_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if ((count ?? 0) >= RATE_LIMIT) {
    return NextResponse.json(
      { error: "Too many submissions. Try again later." },
      { status: 429 },
    );
  }

  const { data: row, error: insertError } = await admin
    .from("labs_submissions")
    .insert({
      user_id: user?.id ?? null,
      locale,
      name,
      email,
      phone,
      audience,
      problem,
      repeating_tasks: repeatingTasks,
      time_spent: timeSpent,
      expectations,
      notes,
      ip_hash: ipHash,
    })
    .select("id")
    .single();

  if (insertError || !row) {
    return NextResponse.json(
      { error: insertError?.message || "Failed to save" },
      { status: 500 },
    );
  }

  let username: string | null = null;
  if (user?.id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();
    username = profile?.username ?? null;
  }

  const wa = whatsAppLink(phone);
  const adminUrl = `${siteBase()}/admin/labs`;
  const lines = [
    "🧪 New Rampungin Labs lead",
    `Name: ${name}`,
    `Email: ${email}`,
    `WhatsApp: ${phone}${wa ? ` (${wa})` : ""}`,
    `Audience: ${audience}`,
    `Time / week: ${timeSpent}`,
    `Expectations: ${expectations.join(", ")}`,
    "",
    `Problem: ${truncate(problem, 800)}`,
    "",
    `Repeating: ${truncate(repeatingTasks, 800)}`,
  ];
  if (notes) lines.push("", `Notes: ${truncate(notes, 400)}`);
  if (username) lines.push("", `Logged-in: @${username}`);
  lines.push("", `Admin: ${adminUrl}`, `Id: ${row.id}`);

  const tg = await sendTelegramMessage(lines.join("\n"));
  if (tg.ok) {
    await admin
      .from("labs_submissions")
      .update({ telegram_sent_at: new Date().toISOString(), telegram_error: null })
      .eq("id", row.id);
  } else {
    await admin
      .from("labs_submissions")
      .update({ telegram_error: tg.error })
      .eq("id", row.id);
  }

  return NextResponse.json({ ok: true, id: row.id });
}
