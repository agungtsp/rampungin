-- rampungin.com seed data
-- Creates user "agungtsp" and 100 example prompts (mix of template + static,
-- spread across all 10 categories, exercising all dynamic field types).
--
-- Idempotent: safe to re-run. Run in the Supabase SQL editor (or `supabase db`).
-- Requires the pgcrypto extension (available on Supabase) for crypt()/gen_salt().

-- 0) Schema patch: allow radio/checkbox field types + category index ----------
alter table public.prompt_fields
  drop constraint if exists prompt_fields_field_type_check;

alter table public.prompt_fields
  add constraint prompt_fields_field_type_check
  check (field_type in ('text', 'textarea', 'select', 'radio', 'checkbox'));

create index if not exists prompts_category_idx on public.prompts(category);

-- 0b) Social media links on profiles ----------------------------------------
alter table public.profiles
  add column if not exists threads_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists linkedin_url text;

-- 1) Auth user (fixed UUID) -------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-4111-8111-111111111111',
  'authenticated', 'authenticated',
  'agungtsp@example.com',
  crypt('rampungin123', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Agung TSP"}',
  '', '', '', ''
)
on conflict (id) do nothing;

-- 2) Profile (trigger may also create it; ensure username is exactly agungtsp)
insert into public.profiles (id, username, display_name, bio)
values (
  '11111111-1111-4111-8111-111111111111',
  'agungtsp',
  'Agung TSP',
  'Berbagi 100+ prompt AI siap pakai untuk marketing, coding, menulis, dan lainnya. Gratis selamanya.'
)
on conflict (id) do update
  set username = excluded.username,
      display_name = excluded.display_name,
      bio = excluded.bio;

-- 3) Reset previously seeded prompts (cascades to fields/likes/comments) -----
delete from public.prompts
where author_id = '11111111-1111-4111-8111-111111111111';

-- 4) Insert 100 prompts ------------------------------------------------------
with nums as (
  select generate_series(1, 100) as i
),
g as (
  select
    i,
    (array['marketing','coding','menulis','desain','bisnis',
           'edukasi','produktivitas','data','hiburan','lainnya'])[1 + (i % 10)] as cat,
    (array['Praktis','Pro','Kreatif','Cepat','Lengkap',
           'Modern','Efektif','Simpel','Ampuh','Instan'])[1 + ((i / 10) % 10)] as variant
  from nums
),
g2 as (
  select
    i, cat, variant,
    case cat
      when 'marketing' then 'Marketing'
      when 'coding' then 'Coding & Dev'
      when 'menulis' then 'Menulis'
      when 'desain' then 'Desain'
      when 'bisnis' then 'Bisnis'
      when 'edukasi' then 'Edukasi'
      when 'produktivitas' then 'Produktivitas'
      when 'data' then 'Data & Analisis'
      when 'hiburan' then 'Hiburan'
      else 'Lainnya'
    end as catlabel,
    case cat
      when 'marketing' then 'Copywriting Marketing'
      when 'coding' then 'Bantuan Coding'
      when 'menulis' then 'Asisten Menulis'
      when 'desain' then 'Ide Desain'
      when 'bisnis' then 'Strategi Bisnis'
      when 'edukasi' then 'Materi Edukasi'
      when 'produktivitas' then 'Boost Produktivitas'
      when 'data' then 'Analisis Data'
      when 'hiburan' then 'Ide Hiburan'
      else 'Prompt Serbaguna'
    end as catphrase,
    (i % 4) <> 0 as is_template
  from g
)
insert into public.prompts (
  id, author_id, title, description, mode, body, category, tags,
  image_path, video_url, is_public, public_until,
  copy_count, like_count, created_at, updated_at
)
select
  md5('rampungin-prompt-' || i)::uuid,
  '11111111-1111-4111-8111-111111111111',
  catphrase || ' ' || variant || ' #' || i,
  'Prompt ' || catlabel || ' siap pakai — ' || lower(variant) || ' dan efisien.',
  case when is_template then 'template' else 'static' end,
  case when is_template then
    'Kamu adalah asisten ' || catlabel || ' profesional.' || chr(10) ||
    'Bantu saya membuat ' || lower(catphrase) || ' tentang {{topik}} untuk audiens {{audiens}}.' || chr(10) ||
    'Gunakan gaya bahasa {{gaya}} dengan format {{format}}.' || chr(10) ||
    'Wajib menyertakan elemen berikut: {{fitur}}.' || chr(10) ||
    'Konteks tambahan: {{detail}}.' || chr(10) ||
    'Hasil harus rapi, spesifik, dan langsung siap dipakai.'
  else
    'Bertindaklah sebagai pakar ' || catlabel || '.' || chr(10) ||
    'Berikan panduan ' || lower(catphrase) || ' langkah demi langkah yang praktis, ' ||
    'lengkap dengan contoh konkret, kesalahan umum yang harus dihindari, ' ||
    'dan checklist ringkas yang bisa langsung diterapkan hari ini.'
  end,
  cat,
  array[cat, lower(variant), 'ai', 'prompt'],
  null,
  null,
  true,
  null,
  (i * 13) % 137,
  (i * 7) % 50,
  now() - (i * interval '1 hour'),
  now() - (i * interval '1 hour')
from g2;

-- 5) Insert fields for template prompts (all 5 dynamic types) ---------------
insert into public.prompt_fields (
  id, prompt_id, field_key, label, field_type, required, options, sort_order, placeholder
)
select
  gen_random_uuid(),
  md5('rampungin-prompt-' || i)::uuid,
  f.field_key, f.label, f.field_type, f.required, f.options, f.sort_order, f.placeholder
from generate_series(1, 100) as i
cross join (values
  ('topik',   'Topik',                  'text',     true,  null::jsonb,                                     0, 'cth: peluncuran produk baru'),
  ('audiens', 'Audiens',                'text',     false, null::jsonb,                                     1, 'cth: Gen Z, profesional muda'),
  ('gaya',    'Gaya bahasa',            'radio',    true,  '["Formal","Santai","Persuasif"]'::jsonb,        2, null),
  ('format',  'Format keluaran',        'select',   false, '["Paragraf","Poin-poin","Tabel"]'::jsonb,       3, null),
  ('fitur',   'Elemen yang disertakan', 'checkbox', false, '["CTA","Hashtag","Emoji","Statistik"]'::jsonb,  4, null),
  ('detail',  'Detail tambahan',        'textarea', false, null::jsonb,                                     5, 'Jelaskan konteks tambahan...')
) as f(field_key, label, field_type, required, options, sort_order, placeholder)
where (i % 4) <> 0;
