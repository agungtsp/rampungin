/**
 * Apply migration (field_type + category index) and seed 100 prompts for @agungtsp.
 *
 * Usage:
 *   node scripts/apply-and-seed.mjs
 *
 * Requires .env with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 * Optional: DATABASE_URL or SUPABASE_DB_PASSWORD (for DDL migration via Postgres).
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const { createHash, randomUUID } = require("crypto");

const ROOT = path.join(__dirname, "..");
const envPath = path.join(ROOT, ".env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const AUTHOR_ID = "11111111-1111-4111-8111-111111111111";
const USERNAME = "agungtsp";
const EMAIL = "agungtsp@example.com";
const PASSWORD = "rampungin123";

const CATEGORIES = [
  "marketing",
  "coding",
  "menulis",
  "desain",
  "bisnis",
  "edukasi",
  "produktivitas",
  "data",
  "hiburan",
  "lainnya",
];
const CATLABEL = {
  marketing: "Marketing",
  coding: "Coding & Dev",
  menulis: "Menulis",
  desain: "Desain",
  bisnis: "Bisnis",
  edukasi: "Edukasi",
  produktivitas: "Produktivitas",
  data: "Data & Analisis",
  hiburan: "Hiburan",
  lainnya: "Lainnya",
};
const CATPHRASE = {
  marketing: "Copywriting Marketing",
  coding: "Bantuan Coding",
  menulis: "Asisten Menulis",
  desain: "Ide Desain",
  bisnis: "Strategi Bisnis",
  edukasi: "Materi Edukasi",
  produktivitas: "Boost Produktivitas",
  data: "Analisis Data",
  hiburan: "Ide Hiburan",
  lainnya: "Prompt Serbaguna",
};
const VARIANTS = [
  "Praktis",
  "Pro",
  "Kreatif",
  "Cepat",
  "Lengkap",
  "Modern",
  "Efektif",
  "Simpel",
  "Ampuh",
  "Instan",
];

const SOCIAL_MIGRATION_SQL = `
alter table public.profiles
  add column if not exists threads_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists linkedin_url text;
`;

const MIGRATION_SQL = `
alter table public.prompt_fields
  drop constraint if exists prompt_fields_field_type_check;
alter table public.prompt_fields
  add constraint prompt_fields_field_type_check
  check (field_type in ('text', 'textarea', 'select', 'radio', 'checkbox'));
create index if not exists prompts_category_idx on public.prompts(category);
` + SOCIAL_MIGRATION_SQL;

function promptId(i) {
  // Deterministic UUID from md5 (same as seed.sql: md5('rampungin-prompt-' || i)::uuid)
  const hex = createHash("md5").update(`rampungin-prompt-${i}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function admin() {
  return createClient(SUPABASE_URL, KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function tryRunMigrationViaPg() {
  let Client;
  try {
    Client = require("pg").Client;
  } catch {
    return { ok: false, reason: "pg not installed" };
  }

  const configs = [];
  if (process.env.DATABASE_URL) {
    configs.push({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  }
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (password) {
    for (const region of ["ap-northeast-1", "ap-southeast-1", "us-east-1", "eu-west-1"]) {
      configs.push({
        host: `aws-0-${region}.pooler.supabase.com`,
        port: 6543,
        user: `postgres.${REF}`,
        password,
        database: "postgres",
        ssl: { rejectUnauthorized: false },
      });
    }
  }

  for (const cfg of configs) {
    const client = new Client({ ...cfg, connectionTimeoutMillis: 8000 });
    try {
      await client.connect();
      await client.query(MIGRATION_SQL);
      await client.end();
      return { ok: true };
    } catch (e) {
      try {
        await client.end();
      } catch {}
      console.warn("pg attempt failed:", e.message.slice(0, 120));
    }
  }
  return { ok: false, reason: "no DATABASE_URL / SUPABASE_DB_PASSWORD or connection failed" };
}

async function ensureUser(sb) {
  // Prefer fixed UUID user; if create with id is unsupported, fall back to list+create
  const { data: listed } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  let user = listed?.users?.find((u) => u.email === EMAIL || u.id === AUTHOR_ID);

  if (!user) {
    const { data, error } = await sb.auth.admin.createUser({
      id: AUTHOR_ID,
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Agung TSP" },
    });
    if (error) {
      // Retry without fixed id (some projects reject custom ids)
      const retry = await sb.auth.admin.createUser({
        email: EMAIL,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Agung TSP" },
      });
      if (retry.error) throw new Error(`createUser failed: ${retry.error.message}`);
      user = retry.data.user;
    } else {
      user = data.user;
    }
  }

  const authorId = user.id;
  // Wait briefly for handle_new_user trigger
  await new Promise((r) => setTimeout(r, 800));

  const { error: profileError } = await sb.from("profiles").upsert(
    {
      id: authorId,
      username: USERNAME,
      display_name: "Agung TSP",
      bio: "Berbagi 100+ prompt AI siap pakai untuk marketing, coding, menulis, dan lainnya. Gratis selamanya.",
    },
    { onConflict: "id" },
  );
  if (profileError) throw new Error(`profile upsert: ${profileError.message}`);

  return authorId;
}

async function probeRadioSupport(sb, authorId) {
  const { data: prompt, error: pErr } = await sb
    .from("prompts")
    .insert({
      author_id: authorId,
      title: "__probe_radio__",
      mode: "template",
      body: "{{x}}",
      category: "lainnya",
      is_public: false,
    })
    .select("id")
    .single();
  if (pErr) throw new Error(`probe prompt: ${pErr.message}`);

  const { error: fErr } = await sb.from("prompt_fields").insert({
    prompt_id: prompt.id,
    field_key: "x",
    label: "X",
    field_type: "radio",
    required: true,
    options: ["A", "B"],
    sort_order: 0,
  });
  await sb.from("prompts").delete().eq("id", prompt.id);
  return !fErr;
}

async function seed(sb, authorId, includeRadioCheckbox) {
  // Remove prior prompts for this author
  const { error: delErr } = await sb.from("prompts").delete().eq("author_id", authorId);
  if (delErr) throw new Error(`delete old prompts: ${delErr.message}`);

  const prompts = [];
  for (let i = 1; i <= 100; i++) {
    const cat = CATEGORIES[i % 10];
    const variant = VARIANTS[Math.floor(i / 10) % 10];
    const isTemplate = i % 4 !== 0;
    const catlabel = CATLABEL[cat];
    const catphrase = CATPHRASE[cat];
    const body = isTemplate
      ? [
          `Kamu adalah asisten ${catlabel} profesional.`,
          `Bantu saya membuat ${catphrase.toLowerCase()} tentang {{topik}} untuk audiens {{audiens}}.`,
          `Gunakan gaya bahasa {{gaya}} dengan format {{format}}.`,
          `Wajib menyertakan elemen berikut: {{fitur}}.`,
          `Konteks tambahan: {{detail}}.`,
          `Hasil harus rapi, spesifik, dan langsung siap dipakai.`,
        ].join("\n")
      : [
          `Bertindaklah sebagai pakar ${catlabel}.`,
          `Berikan panduan ${catphrase.toLowerCase()} langkah demi langkah yang praktis, lengkap dengan contoh konkret, kesalahan umum yang harus dihindari, dan checklist ringkas yang bisa langsung diterapkan hari ini.`,
        ].join(" ");

    const createdAt = new Date(Date.now() - i * 3600_000).toISOString();
    prompts.push({
      id: promptId(i),
      author_id: authorId,
      title: `${catphrase} ${variant} #${i}`,
      description: `Prompt ${catlabel} siap pakai — ${variant.toLowerCase()} dan efisien.`,
      mode: isTemplate ? "template" : "static",
      body,
      category: cat,
      tags: [cat, variant.toLowerCase(), "ai", "prompt"],
      is_public: true,
      public_until: null,
      copy_count: (i * 13) % 137,
      like_count: (i * 7) % 50,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  // Insert in chunks
  for (let i = 0; i < prompts.length; i += 25) {
    const chunk = prompts.slice(i, i + 25);
    const { error } = await sb.from("prompts").insert(chunk);
    if (error) throw new Error(`insert prompts ${i + 1}-${i + chunk.length}: ${error.message}`);
  }

  const fields = [];
  for (let i = 1; i <= 100; i++) {
    if (i % 4 === 0) continue; // static
    const pid = promptId(i);
    const gayaType = includeRadioCheckbox ? "radio" : "select";
    const fiturType = includeRadioCheckbox ? "checkbox" : "select";
    fields.push(
      {
        prompt_id: pid,
        field_key: "topik",
        label: "Topik",
        field_type: "text",
        required: true,
        options: null,
        sort_order: 0,
        placeholder: "cth: peluncuran produk baru",
      },
      {
        prompt_id: pid,
        field_key: "audiens",
        label: "Audiens",
        field_type: "text",
        required: false,
        options: null,
        sort_order: 1,
        placeholder: "cth: Gen Z, profesional muda",
      },
      {
        prompt_id: pid,
        field_key: "gaya",
        label: "Gaya bahasa",
        field_type: gayaType,
        required: true,
        options: ["Formal", "Santai", "Persuasif"],
        sort_order: 2,
        placeholder: null,
      },
      {
        prompt_id: pid,
        field_key: "format",
        label: "Format keluaran",
        field_type: "select",
        required: false,
        options: ["Paragraf", "Poin-poin", "Tabel"],
        sort_order: 3,
        placeholder: null,
      },
      {
        prompt_id: pid,
        field_key: "fitur",
        label: "Elemen yang disertakan",
        field_type: fiturType,
        required: false,
        options: ["CTA", "Hashtag", "Emoji", "Statistik"],
        sort_order: 4,
        placeholder: null,
      },
      {
        prompt_id: pid,
        field_key: "detail",
        label: "Detail tambahan",
        field_type: "textarea",
        required: false,
        options: null,
        sort_order: 5,
        placeholder: "Jelaskan konteks tambahan...",
      },
    );
  }

  for (let i = 0; i < fields.length; i += 50) {
    const chunk = fields.slice(i, i + 50);
    const { error } = await sb.from("prompt_fields").insert(chunk);
    if (error) throw new Error(`insert fields chunk ${i}: ${error.message}`);
  }

  return { prompts: prompts.length, fields: fields.length };
}

async function main() {
  if (!SUPABASE_URL || !KEY || KEY.includes("your-service-role")) {
    throw new Error("Missing valid SUPABASE_SERVICE_ROLE_KEY in .env");
  }

  console.log("Project:", SUPABASE_URL);
  const sb = admin();

  console.log("1) Trying DDL migration via Postgres…");
  const mig = await tryRunMigrationViaPg();
  if (mig.ok) console.log("   Migration applied via pg.");
  else console.log("   Skipped:", mig.reason);

  console.log("2) Ensuring auth user + profile @agungtsp…");
  const authorId = await ensureUser(sb);
  console.log("   author_id:", authorId);

  console.log("3) Checking radio/checkbox support…");
  let radioOk = await probeRadioSupport(sb, authorId);
  console.log("   radio supported:", radioOk);

  if (!radioOk) {
    console.log("   Attempting migration via SQL editor workaround is required.");
    console.log("   Will seed with select fallbacks for radio/checkbox for now.");
  }

  console.log("4) Seeding 100 prompts…");
  const result = await seed(sb, authorId, radioOk);
  console.log("   Done:", result);

  const { count } = await sb
    .from("prompts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", authorId);
  console.log("   prompts for agungtsp:", count);

  if (!radioOk) {
    console.log("\n⚠️  Migration not applied yet. Paste this in Supabase SQL Editor,");
    console.log("   then re-run: node scripts/apply-and-seed.cjs\n");
    console.log(MIGRATION_SQL);
  } else {
    console.log("\n✓ Migration + seed complete. Profile: /profile/agungtsp");
  }
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
