/**
 * Apply pending DDL migrations (social columns + radio/checkbox field types).
 *
 * Option A (recommended): paste the SQL printed below into Supabase SQL Editor.
 * Option B: add to .env then run this script:
 *   SUPABASE_DB_PASSWORD=your-db-password
 *   or DATABASE_URL=postgresql://postgres.[ref]:[pw]@aws-0-….pooler.supabase.com:6543/postgres
 * Option C: SUPABASE_ACCESS_TOKEN=sbp_… (Personal Access Token from supabase.com/dashboard/account/tokens)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const REF = new URL(SUPABASE_URL).hostname.split(".")[0];
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SQL = `
-- 1) Dynamic field types
alter table public.prompt_fields
  drop constraint if exists prompt_fields_field_type_check;
alter table public.prompt_fields
  add constraint prompt_fields_field_type_check
  check (field_type in ('text', 'textarea', 'select', 'radio', 'checkbox'));
create index if not exists prompts_category_idx on public.prompts(category);

-- 2) Profile social links
alter table public.profiles
  add column if not exists threads_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists linkedin_url text;

-- 3) Generate click counter
alter table public.prompts
  add column if not exists generate_count int not null default 0;

create or replace function public.increment_generate_count(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.prompts
  set generate_count = generate_count + 1
  where id = p_id
    and public.is_effectively_public(is_public, public_until);
end;
$$;

grant execute on function public.increment_generate_count(uuid) to anon, authenticated;
`.trim();

async function viaPg() {
  const { Client } = require("pg");
  const configs = [];
  if (process.env.DATABASE_URL) {
    configs.push({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (password) {
    for (const region of [
      "ap-northeast-1",
      "ap-southeast-1",
      "us-east-1",
      "eu-west-1",
    ]) {
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
      await client.query(SQL);
      await client.end();
      return true;
    } catch (e) {
      console.warn("pg:", e.message.slice(0, 140));
      try {
        await client.end();
      } catch {}
    }
  }
  return false;
}

async function viaManagementApi() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return false;
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    },
  );
  const text = await res.text();
  if (!res.ok) {
    console.warn("management api:", res.status, text.slice(0, 200));
    return false;
  }
  console.log("management api ok:", text.slice(0, 120));
  return true;
}

async function verify() {
  const { createClient } = require("@supabase/supabase-js");
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: socialErr } = await sb
    .from("profiles")
    .select("threads_url")
    .limit(1);
  const socialOk = !socialErr;

  // probe radio by checking constraint via a dry run on a fake insert that we roll back
  // Use a real author prompt if any
  const { data: prompt } = await sb
    .from("prompts")
    .select("id")
    .limit(1)
    .maybeSingle();
  let radioOk = false;
  if (prompt?.id) {
    const { error } = await sb.from("prompt_fields").insert({
      prompt_id: prompt.id,
      field_key: `__probe_${Date.now()}`,
      label: "probe",
      field_type: "radio",
      required: false,
      options: ["a"],
      sort_order: 9999,
    });
    if (!error) {
      radioOk = true;
      await sb
        .from("prompt_fields")
        .delete()
        .eq("prompt_id", prompt.id)
        .eq("label", "probe");
    } else {
      console.log("radio still blocked:", error.message);
    }
  }
  return { socialOk, radioOk };
}

async function seedSocials() {
  const { createClient } = require("@supabase/supabase-js");
  const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await sb
    .from("profiles")
    .update({
      threads_url: "https://www.threads.net/@agungtsp",
      instagram_url: "https://www.instagram.com/agungtsp",
      youtube_url: "https://www.youtube.com/@agungtsp",
      linkedin_url: "https://www.linkedin.com/in/agungtsp",
      bio: "Berbagi 100+ prompt AI siap pakai. Follow media sosial saya!",
      updated_at: new Date().toISOString(),
    })
    .eq("username", "agungtsp");
  if (error) throw new Error(error.message);
}

async function main() {
  console.log("Project:", SUPABASE_URL);
  console.log("SQL Editor:", `https://supabase.com/dashboard/project/${REF}/sql/new`);
  console.log("\n--- SQL to run ---\n" + SQL + "\n------------------\n");

  let applied = await viaPg();
  if (!applied) applied = await viaManagementApi();

  if (!applied) {
    console.error(
      "Could not apply DDL automatically.\n" +
        "Add SUPABASE_DB_PASSWORD or SUPABASE_ACCESS_TOKEN to .env, OR paste the SQL above in the SQL Editor, then re-run:\n" +
        "  node scripts/migrate.cjs",
    );
    process.exit(2);
  }

  // PostgREST schema cache can lag a moment
  await new Promise((r) => setTimeout(r, 1500));
  const { socialOk, radioOk } = await verify();
  console.log("verify social columns:", socialOk);
  console.log("verify radio/checkbox:", radioOk);

  if (socialOk) {
    await seedSocials();
    console.log("Seeded sample social links on @agungtsp");
  }

  if (radioOk) {
    console.log("Re-seeding prompts with radio/checkbox…");
    require("child_process").execSync("node scripts/apply-and-seed.cjs", {
      cwd: ROOT,
      stdio: "inherit",
    });
  }

  console.log("\nDone. Check /profile/agungtsp and /me");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
