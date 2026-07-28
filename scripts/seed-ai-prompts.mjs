#!/usr/bin/env node
/**
 * Generate AI cover images, upload to Supabase Storage, seed ≥10 bilingual prompts
 * with simple fields + example input/output in usage_guide.
 *
 * Usage:
 *   node scripts/seed-ai-prompts.mjs
 *
 * Requires .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional:
 *   SEED_USERNAME=agungtsp          # resolve author profile
 *   SEED_AUTHOR_ID=<uuid>           # override author
 *   SEED_SKIP_IMAGES=1              # skip AI image gen (use picsum fallback)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { AI_SEED_PROMPTS } from "./seed-ai-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const envPath = path.join(ROOT, ".env");

for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SKIP_IMAGES = process.env.SEED_SKIP_IMAGES === "1";
const USERNAME = process.env.SEED_USERNAME || "agungtsp";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function resolveAuthorId() {
  if (process.env.SEED_AUTHOR_ID) return process.env.SEED_AUTHOR_ID;
  const { data, error } = await sb
    .from("profiles")
    .select("id, username")
    .eq("username", USERNAME)
    .maybeSingle();
  if (error) throw error;
  if (!data?.id) {
    throw new Error(
      `Profile @${USERNAME} not found. Set SEED_AUTHOR_ID or create the profile first.`,
    );
  }
  console.log(`Author: @${data.username} (${data.id})`);
  return data.id;
}

async function fetchAiImage(promptText, seed) {
  const url =
    `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}` +
    `?width=800&height=800&seed=${seed}&nologo=true&model=flux&enhance=true`;
  const res = await fetch(url, {
    headers: { Accept: "image/*" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`Image gen HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1000) throw new Error("Image too small / empty");
  return buf;
}

async function fetchPicsum(seed) {
  const res = await fetch(`https://picsum.photos/seed/${seed}/800/800`, {
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Picsum HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function uploadCover(authorId, slug, locale, buffer) {
  const objectPath = `${authorId}/seed-ai/${slug}-${locale}.jpg`;
  const { error } = await sb.storage.from("prompt-images").upload(objectPath, buffer, {
    contentType: "image/jpeg",
    upsert: true,
    cacheControl: "31536000",
  });
  if (error) throw error;
  return objectPath;
}

function buildUsageGuide(p, locale) {
  const isEn = locale === "en";
  const lines = [];
  lines.push(isEn ? "## How to use" : "## Cara pakai");
  lines.push(
    isEn
      ? "1. Fill the simple fields below (keep them short)."
      : "1. Isi field sederhana di bawah (singkat saja).",
  );
  lines.push(
    isEn
      ? "2. Click Generate, then Copy or open ChatGPT / AI Studio."
      : "2. Klik Hasilkan, lalu Salin atau buka ChatGPT / AI Studio.",
  );
  if (Object.keys(p.example_input || {}).length) {
    lines.push("");
    lines.push(isEn ? "## Example input" : "## Contoh input");
    for (const [k, v] of Object.entries(p.example_input)) {
      lines.push(`- **${k}:** ${v}`);
    }
  }
  return lines.join("\n");
}

async function ensureImage(authorId, p, locale, attempt = 0) {
  const seedNum =
    parseInt(
      createStableSeed(`${p.key}-${locale}`),
      16,
    ) % 1_000_000;
  try {
    if (SKIP_IMAGES) {
      const buf = await fetchPicsum(`rampungin-${p.key}-${locale}`);
      return uploadCover(authorId, p.key, locale, buf);
    }
    const theme =
      locale === "en"
        ? `${p.cover_prompt}, English marketplace vibe`
        : `${p.cover_prompt}, Indonesian marketplace vibe`;
    console.log(`  → AI image ${p.key}/${locale}…`);
    const buf = await fetchAiImage(theme, seedNum + attempt);
    return uploadCover(authorId, p.key, locale, buf);
  } catch (err) {
    if (attempt < 2) {
      console.warn(`  retry ${p.key}/${locale}: ${err.message}`);
      await sleep(1500);
      return ensureImage(authorId, p, locale, attempt + 1);
    }
    console.warn(`  fallback picsum ${p.key}/${locale}: ${err.message}`);
    const buf = await fetchPicsum(`rampungin-${p.key}-${locale}`);
    return uploadCover(authorId, p.key, locale, buf);
  }
}

function hashNum(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function createStableSeed(s) {
  return hashNum(s).toString(16);
}

async function upsertPrompt(authorId, p, imageId, imageEn) {
  const row = {
    id: p.id,
    author_id: authorId,
    title: p.title,
    description: p.description,
    mode: p.mode,
    body: p.body,
    category: p.category,
    tags: p.tags,
    title_en: p.title_en,
    description_en: p.description_en,
    body_en: p.body_en,
    tags_en: p.tags_en,
    image_path: imageId,
    image_path_en: imageEn,
    ai_platform: p.ai_platform,
    usage_guide: buildUsageGuide(p, "id"),
    usage_guide_en: buildUsageGuide(p, "en"),
    video_url: null,
    is_public: true,
    public_until: null,
    copy_count: 10 + (hashNum(p.key) % 40),
    like_count: 5 + (hashNum(p.key) % 20),
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from("prompts").upsert(row, { onConflict: "id" });
  if (error) throw error;

  await sb.from("prompt_fields").delete().eq("prompt_id", p.id);

  if (p.fields?.length) {
    const fields = p.fields.map((f) => ({
      prompt_id: p.id,
      field_key: f.field_key,
      label: f.label,
      field_type: f.field_type,
      required: f.required,
      options: f.options ?? null,
      sort_order: f.sort_order,
      placeholder: f.placeholder ?? null,
    }));
    const { error: fe } = await sb.from("prompt_fields").insert(fields);
    if (fe) throw fe;
  }
}

async function writeLocalExamples(results) {
  const outDir = path.join(ROOT, "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "seed-ai-examples.json");
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Examples written: ${outPath}`);
}

async function main() {
  console.log(`Seeding ${AI_SEED_PROMPTS.length} AI prompts…`);
  const authorId = await resolveAuthorId();
  const examples = [];

  for (const p of AI_SEED_PROMPTS) {
    console.log(`\n• ${p.key} — ${p.title}`);
    const imageId = await ensureImage(authorId, p, "id");
    await sleep(SKIP_IMAGES ? 200 : 800);
    const imageEn = await ensureImage(authorId, p, "en");
    await upsertPrompt(authorId, p, imageId, imageEn);
    examples.push({
      id: p.id,
      key: p.key,
      title: p.title,
      title_en: p.title_en,
      image_path: imageId,
      image_path_en: imageEn,
      public_url_id: `${SUPABASE_URL}/storage/v1/object/public/prompt-images/${imageId}`,
      public_url_en: `${SUPABASE_URL}/storage/v1/object/public/prompt-images/${imageEn}`,
      example_input: p.example_input,
      example_output_id: p.example_output_id,
      example_output_en: p.example_output_en,
    });
    console.log(`  ✓ saved (${imageId})`);
    await sleep(SKIP_IMAGES ? 100 : 500);
  }

  await writeLocalExamples(examples);
  console.log(`\nDone. ${examples.length} prompts for @${USERNAME}.`);
  console.log(`Profile: /profile/${USERNAME}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
