-- rampungin.com seed data (bilingual samples)
-- Idempotent. Run in Supabase SQL editor after migrations (incl. i18n + image_path_en).
-- Requires pgcrypto for crypt()/gen_salt().

alter table public.prompt_fields
  drop constraint if exists prompt_fields_field_type_check;

alter table public.prompt_fields
  add constraint prompt_fields_field_type_check
  check (field_type in ('text', 'textarea', 'select', 'radio', 'checkbox'));

create index if not exists prompts_category_idx on public.prompts(category);

alter table public.profiles
  add column if not exists threads_url text,
  add column if not exists instagram_url text,
  add column if not exists youtube_url text,
  add column if not exists linkedin_url text;

-- Auth user -----------------------------------------------------------------
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

insert into public.profiles (id, username, display_name, bio)
values (
  '11111111-1111-4111-8111-111111111111',
  'agungtsp',
  'Agung TSP',
  'Berbagi prompt AI bilingual (ID/EN) siap pakai. Gratis selamanya.'
)
on conflict (id) do update
  set username = excluded.username,
      display_name = excluded.display_name,
      bio = excluded.bio;

-- Wipe previous samples for this author (cascades fields/likes/saves/ratings)
delete from public.prompts
where author_id = '11111111-1111-4111-8111-111111111111';

-- 20 bilingual prompts ------------------------------------------------------
insert into public.prompts (
  id, author_id, title, description, mode, body, category, tags,
  title_en, description_en, body_en, tags_en,
  image_path, image_path_en, ai_platform,
  video_url, is_public, public_until,
  copy_count, like_count, created_at, updated_at
)
values
(
  md5('rampungin-bilingual-1')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Copy iklan produk singkat',
  'Template marketing untuk CTA yang tajam.',
  'template',
  'Kamu adalah copywriter marketing.' || chr(10) ||
  'Buat 3 variasi copy iklan untuk produk {{produk}}.' || chr(10) ||
  'Target audiens: {{audiens}}. Nada: {{nada}}.' || chr(10) ||
  'Sertakan CTA yang jelas.',
  'marketing',
  array['marketing','copy','cta'],
  'Short product ad copy',
  'Marketing template for a sharp CTA.',
  'You are a marketing copywriter.' || chr(10) ||
  'Write 3 ad copy variants for {{produk}}.' || chr(10) ||
  'Audience: {{audiens}}. Tone: {{nada}}.' || chr(10) ||
  'Include a clear CTA.',
  array['marketing','copy','cta'],
  'https://picsum.photos/seed/rampungin-id-1/800/800',
  'https://picsum.photos/seed/rampungin-en-1/800/800',
  'all',
  null, true, null, 42, 18,
  now() - interval '20 hours', now() - interval '20 hours'
),
(
  md5('rampungin-bilingual-2')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Review kode TypeScript',
  'Prompt statis untuk review PR yang rapi.',
  'static',
  'Bertindak sebagai senior engineer TypeScript.' || chr(10) ||
  'Review cuplikan kode berikut: fokus pada bug, keamanan, performa, dan keterbacaan.' || chr(10) ||
  'Berikan temuan berprioritas plus saran perbaikan konkret.',
  'coding',
  array['coding','typescript','review'],
  'TypeScript code review',
  'Static prompt for clean PR reviews.',
  'Act as a senior TypeScript engineer.' || chr(10) ||
  'Review the following code: focus on bugs, security, performance, and readability.' || chr(10) ||
  'Provide prioritized findings and concrete fix suggestions.',
  array['coding','typescript','review'],
  'https://picsum.photos/seed/rampungin-id-2/800/800',
  'https://picsum.photos/seed/rampungin-en-2/800/800',
  'chatgpt',
  null, true, null, 55, 22,
  now() - interval '19 hours', now() - interval '19 hours'
),
(
  md5('rampungin-bilingual-3')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Outline artikel blog',
  'Susun kerangka artikel SEO-friendly.',
  'template',
  'Kamu adalah editor konten.' || chr(10) ||
  'Buat outline artikel tentang {{topik}} untuk pembaca {{pembaca}}.' || chr(10) ||
  'Panjang target: {{panjang}}. Sertakan H2/H3 dan ide meta description.',
  'menulis',
  array['menulis','blog','seo'],
  'Blog article outline',
  'Build an SEO-friendly article outline.',
  'You are a content editor.' || chr(10) ||
  'Create an article outline about {{topik}} for {{pembaca}} readers.' || chr(10) ||
  'Target length: {{panjang}}. Include H2/H3 and a meta description idea.',
  array['writing','blog','seo'],
  'https://picsum.photos/seed/rampungin-id-3/800/800',
  'https://picsum.photos/seed/rampungin-en-3/800/800',
  'gemini',
  null, true, null, 33, 11,
  now() - interval '18 hours', now() - interval '18 hours'
),
(
  md5('rampungin-bilingual-4')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Brief desain landing page',
  'Jelaskan arah visual untuk desainer.',
  'template',
  'Kamu adalah product designer.' || chr(10) ||
  'Tulis brief desain landing page untuk {{produk}}.' || chr(10) ||
  'Gaya visual: {{gaya}}. Sertakan hierarki, warna, dan komponen utama.',
  'desain',
  array['desain','ui','brief'],
  'Landing page design brief',
  'Explain visual direction for designers.',
  'You are a product designer.' || chr(10) ||
  'Write a landing page design brief for {{produk}}.' || chr(10) ||
  'Visual style: {{gaya}}. Include hierarchy, colors, and key components.',
  array['design','ui','brief'],
  'https://picsum.photos/seed/rampungin-id-4/800/800',
  'https://picsum.photos/seed/rampungin-en-4/800/800',
  'all',
  null, true, null, 28, 9,
  now() - interval '17 hours', now() - interval '17 hours'
),
(
  md5('rampungin-bilingual-5')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Pitch elevator 60 detik',
  'Ringkas nilai bisnis dalam satu menit.',
  'static',
  'Buat elevator pitch 60 detik untuk startup SaaS B2B.' || chr(10) ||
  'Struktur: masalah → solusi → bukti → ajakan singkat.' || chr(10) ||
  'Bahasa jelas, tanpa jargon berlebihan.',
  'bisnis',
  array['bisnis','pitch'],
  '60-second elevator pitch',
  'Compress business value into one minute.',
  'Create a 60-second elevator pitch for a B2B SaaS startup.' || chr(10) ||
  'Structure: problem → solution → proof → short ask.' || chr(10) ||
  'Clear language, minimal jargon.',
  array['business','pitch'],
  'https://picsum.photos/seed/rampungin-id-5/800/800',
  'https://picsum.photos/seed/rampungin-en-5/800/800',
  'chatgpt',
  null, true, null, 21, 7,
  now() - interval '16 hours', now() - interval '16 hours'
),
(
  md5('rampungin-bilingual-6')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Rencana belajar mingguan',
  'Template edukasi untuk fokus belajar.',
  'template',
  'Kamu adalah tutor sabar.' || chr(10) ||
  'Buat rencana belajar 7 hari untuk {{materi}}.' || chr(10) ||
  'Level: {{level}}. Setiap hari: tujuan, aktivitas, dan cara mengecek pemahaman.',
  'edukasi',
  array['edukasi','belajar'],
  'Weekly learning plan',
  'Education template for focused study.',
  'You are a patient tutor.' || chr(10) ||
  'Create a 7-day learning plan for {{materi}}.' || chr(10) ||
  'Level: {{level}}. Each day: goal, activity, and a comprehension check.',
  array['education','learning'],
  'https://picsum.photos/seed/rampungin-id-6/800/800',
  'https://picsum.photos/seed/rampungin-en-6/800/800',
  'gemini',
  null, true, null, 40, 14,
  now() - interval '15 hours', now() - interval '15 hours'
),
(
  md5('rampungin-bilingual-7')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Prioritas tugas harian',
  'Rapikan to-do dengan metode sederhana.',
  'template',
  'Bantu saya menyusun prioritas tugas hari ini.' || chr(10) ||
  'Daftar tugas: {{tugas}}.' || chr(10) ||
  'Batasan waktu: {{waktu}}. Kelompokkan Must / Should / Later dan sarankan urutan kerja.',
  'produktivitas',
  array['produktivitas','todo'],
  'Daily task priorities',
  'Tidy a to-do list with a simple method.',
  'Help me prioritize today’s tasks.' || chr(10) ||
  'Task list: {{tugas}}.' || chr(10) ||
  'Time limit: {{waktu}}. Group Must / Should / Later and suggest a work order.',
  array['productivity','todo'],
  'https://picsum.photos/seed/rampungin-id-7/800/800',
  'https://picsum.photos/seed/rampungin-en-7/800/800',
  'all',
  null, true, null, 36, 12,
  now() - interval '14 hours', now() - interval '14 hours'
),
(
  md5('rampungin-bilingual-8')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Ringkas insight dashboard',
  'Ubah angka mentah jadi narasi keputusan.',
  'template',
  'Kamu adalah analis data.' || chr(10) ||
  'Dari metrik berikut: {{metrik}}' || chr(10) ||
  'Tulis 5 insight bisnis + 3 rekomendasi tindakan untuk {{konteks}}.',
  'data',
  array['data','insight'],
  'Summarize dashboard insights',
  'Turn raw numbers into decision narratives.',
  'You are a data analyst.' || chr(10) ||
  'From these metrics: {{metrik}}' || chr(10) ||
  'Write 5 business insights + 3 action recommendations for {{konteks}}.',
  array['data','insights'],
  'https://picsum.photos/seed/rampungin-id-8/800/800',
  'https://picsum.photos/seed/rampungin-en-8/800/800',
  'chatgpt',
  null, true, null, 31, 10,
  now() - interval '13 hours', now() - interval '13 hours'
),
(
  md5('rampungin-bilingual-9')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Ide skenario video pendek',
  'Brainstorm konten hiburan 30–60 detik.',
  'static',
  'Berikan 10 ide skenario video pendek untuk kreator lifestyle.' || chr(10) ||
  'Tiap ide: hook 3 detik, isi, dan punchline penutup.',
  'hiburan',
  array['hiburan','video','ide'],
  'Short video scenario ideas',
  'Brainstorm 30–60s entertainment content.',
  'Give 10 short-video scenario ideas for lifestyle creators.' || chr(10) ||
  'Each idea: 3-second hook, body, and closing punchline.',
  array['entertainment','video','ideas'],
  'https://picsum.photos/seed/rampungin-id-9/800/800',
  'https://picsum.photos/seed/rampungin-en-9/800/800',
  'gemini',
  null, true, null, 19, 6,
  now() - interval '12 hours', now() - interval '12 hours'
),
(
  md5('rampungin-bilingual-10')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Prompt serbaguna riset cepat',
  'Cepat kumpulkan fakta dan sumber.',
  'template',
  'Lakukan riset singkat tentang {{topik}}.' || chr(10) ||
  'Berikan: ringkasan, poin penting, risiko, dan pertanyaan lanjutan.' || chr(10) ||
  'Format: {{format}}.',
  'lainnya',
  array['riset','serbaguna'],
  'Quick research utility prompt',
  'Gather facts and sources fast.',
  'Do a short research brief on {{topik}}.' || chr(10) ||
  'Provide: summary, key points, risks, and follow-up questions.' || chr(10) ||
  'Format: {{format}}.',
  array['research','utility'],
  'https://picsum.photos/seed/rampungin-id-10/800/800',
  'https://picsum.photos/seed/rampungin-en-10/800/800',
  'all',
  null, true, null, 27, 8,
  now() - interval '11 hours', now() - interval '11 hours'
),
(
  md5('rampungin-bilingual-11')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Email cold outreach',
  'Template email pendek yang sopan.',
  'template',
  'Tulis email cold outreach ke {{perusahaan}}.' || chr(10) ||
  'Nilai yang ditawarkan: {{nilai}}. Panjang maksimal 120 kata.',
  'marketing',
  array['email','outreach'],
  'Cold outreach email',
  'Short polite email template.',
  'Write a cold outreach email to {{perusahaan}}.' || chr(10) ||
  'Value offered: {{nilai}}. Max 120 words.',
  array['email','outreach'],
  'https://picsum.photos/seed/rampungin-id-11/800/800',
  'https://picsum.photos/seed/rampungin-en-11/800/800',
  'chatgpt',
  null, true, null, 24, 8,
  now() - interval '10 hours', now() - interval '10 hours'
),
(
  md5('rampungin-bilingual-12')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Debug error runtime',
  'Bantu diagnose stack trace.',
  'template',
  'Jelaskan penyebab kemungkinan error berikut dan langkah perbaikan:' || chr(10) ||
  '{{error}}' || chr(10) ||
  'Stack: {{stack}}. Bahasa/runtime: {{runtime}}.',
  'coding',
  array['coding','debug'],
  'Debug a runtime error',
  'Help diagnose a stack trace.',
  'Explain likely causes of this error and fix steps:' || chr(10) ||
  '{{error}}' || chr(10) ||
  'Stack: {{stack}}. Language/runtime: {{runtime}}.',
  array['coding','debug'],
  'https://picsum.photos/seed/rampungin-id-12/800/800',
  'https://picsum.photos/seed/rampungin-en-12/800/800',
  'gemini',
  null, true, null, 48, 16,
  now() - interval '9 hours', now() - interval '9 hours'
),
(
  md5('rampungin-bilingual-13')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Perbaiki paragraf menjadi profesional',
  'Edit nada tulisan bisnis.',
  'template',
  'Perbaiki teks berikut agar lebih profesional dan ringkas:' || chr(10) ||
  '{{teks}}' || chr(10) ||
  'Pertahankan makna. Nada: {{nada}}.',
  'menulis',
  array['edit','bisnis'],
  'Polish text to sound professional',
  'Edit business writing tone.',
  'Rewrite the following text to be more professional and concise:' || chr(10) ||
  '{{teks}}' || chr(10) ||
  'Keep the meaning. Tone: {{nada}}.',
  array['edit','business'],
  'https://picsum.photos/seed/rampungin-id-13/800/800',
  'https://picsum.photos/seed/rampungin-en-13/800/800',
  'all',
  null, true, null, 29, 9,
  now() - interval '8 hours', now() - interval '8 hours'
),
(
  md5('rampungin-bilingual-14')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Palette warna brand',
  'Usulkan palet dan alasan pemilihan.',
  'static',
  'Usulkan 1 palet warna brand (primer, sekunder, netral, aksen) untuk aplikasi fintech modern.' || chr(10) ||
  'Jelaskan kontras aksesibilitas dan kapan memakai setiap warna.',
  'desain',
  array['desain','warna'],
  'Brand color palette',
  'Propose a palette and rationale.',
  'Propose 1 brand color palette (primary, secondary, neutral, accent) for a modern fintech app.' || chr(10) ||
  'Explain accessibility contrast and when to use each color.',
  array['design','color'],
  'https://picsum.photos/seed/rampungin-id-14/800/800',
  'https://picsum.photos/seed/rampungin-en-14/800/800',
  'chatgpt',
  null, true, null, 17, 5,
  now() - interval '7 hours', now() - interval '7 hours'
),
(
  md5('rampungin-bilingual-15')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Analisis kompetitor cepat',
  'Bandingkan 3 pemain pasar.',
  'template',
  'Analisis kompetitor untuk {{produk}} melawan {{kompetitor}}.' || chr(10) ||
  'Tabel: positioning, kekuatan, kelemahan, peluang diferensiasi.',
  'bisnis',
  array['bisnis','kompetitor'],
  'Quick competitor analysis',
  'Compare three market players.',
  'Analyze competitors for {{produk}} against {{kompetitor}}.' || chr(10) ||
  'Table: positioning, strengths, weaknesses, differentiation opportunities.',
  array['business','competitors'],
  'https://picsum.photos/seed/rampungin-id-15/800/800',
  'https://picsum.photos/seed/rampungin-en-15/800/800',
  'gemini',
  null, true, null, 22, 7,
  now() - interval '6 hours', now() - interval '6 hours'
),
(
  md5('rampungin-bilingual-16')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Kuis pemahaman materi',
  'Buat soal dan kunci jawaban.',
  'template',
  'Buat 8 soal pilihan ganda tentang {{materi}} untuk level {{level}}.' || chr(10) ||
  'Sertakan kunci + penjelasan singkat tiap jawaban.',
  'edukasi',
  array['kuis','edukasi'],
  'Comprehension quiz',
  'Generate questions and an answer key.',
  'Create 8 multiple-choice questions about {{materi}} for {{level}} level.' || chr(10) ||
  'Include the key + a short explanation for each answer.',
  array['quiz','education'],
  'https://picsum.photos/seed/rampungin-id-16/800/800',
  'https://picsum.photos/seed/rampungin-en-16/800/800',
  'all',
  null, true, null, 26, 8,
  now() - interval '5 hours', now() - interval '5 hours'
),
(
  md5('rampungin-bilingual-17')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Agenda meeting efisien',
  'Susun agenda 30 menit yang fokus.',
  'static',
  'Buat agenda meeting 30 menit untuk sync tim produk.' || chr(10) ||
  'Sertakan tujuan, timebox per topik, dan output yang diharapkan.',
  'produktivitas',
  array['meeting','agenda'],
  'Efficient meeting agenda',
  'Build a focused 30-minute agenda.',
  'Create a 30-minute meeting agenda for a product team sync.' || chr(10) ||
  'Include goal, timeboxes per topic, and expected outputs.',
  array['meeting','agenda'],
  'https://picsum.photos/seed/rampungin-id-17/800/800',
  'https://picsum.photos/seed/rampungin-en-17/800/800',
  'chatgpt',
  null, true, null, 15, 4,
  now() - interval '4 hours', now() - interval '4 hours'
),
(
  md5('rampungin-bilingual-18')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'SQL query dari pertanyaan bisnis',
  'Ubah kebutuhan bisnis jadi SQL.',
  'template',
  'Tulis SQL (PostgreSQL) untuk menjawab: {{pertanyaan}}.' || chr(10) ||
  'Skema tabel: {{skema}}. Jelaskan asumsi singkat.',
  'data',
  array['sql','data'],
  'SQL from a business question',
  'Turn a business need into SQL.',
  'Write PostgreSQL SQL to answer: {{pertanyaan}}.' || chr(10) ||
  'Table schema: {{skema}}. State brief assumptions.',
  array['sql','data'],
  'https://picsum.photos/seed/rampungin-id-18/800/800',
  'https://picsum.photos/seed/rampungin-en-18/800/800',
  'gemini',
  null, true, null, 38, 13,
  now() - interval '3 hours', now() - interval '3 hours'
),
(
  md5('rampungin-bilingual-19')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Caption Instagram engaging',
  'Caption + hashtag set.',
  'template',
  'Buat 3 caption Instagram untuk {{konten}}.' || chr(10) ||
  'Gaya: {{gaya}}. Sertakan CTA dan 8 hashtag relevan.',
  'hiburan',
  array['instagram','caption'],
  'Engaging Instagram caption',
  'Caption + hashtag set.',
  'Write 3 Instagram captions for {{konten}}.' || chr(10) ||
  'Style: {{gaya}}. Include a CTA and 8 relevant hashtags.',
  array['instagram','caption'],
  'https://picsum.photos/seed/rampungin-id-19/800/800',
  'https://picsum.photos/seed/rampungin-en-19/800/800',
  'all',
  null, true, null, 44, 15,
  now() - interval '2 hours', now() - interval '2 hours'
),
(
  md5('rampungin-bilingual-20')::uuid,
  '11111111-1111-4111-8111-111111111111',
  'Checklist peluncuran fitur',
  'Pastikan go-live aman.',
  'static',
  'Buat checklist peluncuran fitur web: QA, monitoring, rollback, komunikasi stakeholder, dan dokumen postmortem singkat.',
  'lainnya',
  array['checklist','rilis'],
  'Feature launch checklist',
  'Keep go-live safe.',
  'Create a web feature launch checklist: QA, monitoring, rollback, stakeholder comms, and a short postmortem doc.',
  array['checklist','release'],
  'https://picsum.photos/seed/rampungin-id-20/800/800',
  'https://picsum.photos/seed/rampungin-en-20/800/800',
  'all',
  null, true, null, 18, 6,
  now() - interval '1 hour', now() - interval '1 hour'
);

-- Fields for template prompts -----------------------------------------------
insert into public.prompt_fields (
  id, prompt_id, field_key, label, field_type, required, options, sort_order, placeholder
)
select gen_random_uuid(), p.id, f.field_key, f.label, f.field_type, f.required, f.options, f.sort_order, f.placeholder
from (
  values
    (md5('rampungin-bilingual-1')::uuid, 'produk', 'Produk', 'text', true, null::jsonb, 0, 'cth: sepatu lari'),
    (md5('rampungin-bilingual-1')::uuid, 'audiens', 'Audiens', 'text', true, null::jsonb, 1, 'cth: pelari pemula'),
    (md5('rampungin-bilingual-1')::uuid, 'nada', 'Nada', 'radio', true, '["Formal","Santai","Persuasif"]'::jsonb, 2, null),
    (md5('rampungin-bilingual-3')::uuid, 'topik', 'Topik', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-3')::uuid, 'pembaca', 'Pembaca', 'text', false, null::jsonb, 1, null),
    (md5('rampungin-bilingual-3')::uuid, 'panjang', 'Panjang', 'select', false, '["800 kata","1200 kata","1800 kata"]'::jsonb, 2, null),
    (md5('rampungin-bilingual-4')::uuid, 'produk', 'Produk', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-4')::uuid, 'gaya', 'Gaya', 'select', true, '["Minimal","Bold","Soft"]'::jsonb, 1, null),
    (md5('rampungin-bilingual-6')::uuid, 'materi', 'Materi', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-6')::uuid, 'level', 'Level', 'radio', true, '["Pemula","Menengah","Lanjut"]'::jsonb, 1, null),
    (md5('rampungin-bilingual-7')::uuid, 'tugas', 'Tugas', 'textarea', true, null::jsonb, 0, 'satu baris per tugas'),
    (md5('rampungin-bilingual-7')::uuid, 'waktu', 'Waktu', 'text', false, null::jsonb, 1, 'cth: 4 jam'),
    (md5('rampungin-bilingual-8')::uuid, 'metrik', 'Metrik', 'textarea', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-8')::uuid, 'konteks', 'Konteks', 'text', true, null::jsonb, 1, null),
    (md5('rampungin-bilingual-10')::uuid, 'topik', 'Topik', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-10')::uuid, 'format', 'Format', 'select', false, '["Bullet","Paragraf","Tabel"]'::jsonb, 1, null),
    (md5('rampungin-bilingual-11')::uuid, 'perusahaan', 'Perusahaan', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-11')::uuid, 'nilai', 'Nilai', 'textarea', true, null::jsonb, 1, null),
    (md5('rampungin-bilingual-12')::uuid, 'error', 'Error', 'textarea', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-12')::uuid, 'stack', 'Stack', 'textarea', false, null::jsonb, 1, null),
    (md5('rampungin-bilingual-12')::uuid, 'runtime', 'Runtime', 'text', false, null::jsonb, 2, 'Node / Browser / Python'),
    (md5('rampungin-bilingual-13')::uuid, 'teks', 'Teks', 'textarea', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-13')::uuid, 'nada', 'Nada', 'radio', true, '["Formal","Hangat","Tegas"]'::jsonb, 1, null),
    (md5('rampungin-bilingual-15')::uuid, 'produk', 'Produk', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-15')::uuid, 'kompetitor', 'Kompetitor', 'text', true, null::jsonb, 1, 'pisahkan koma'),
    (md5('rampungin-bilingual-16')::uuid, 'materi', 'Materi', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-16')::uuid, 'level', 'Level', 'select', true, '["SMP","SMA","Kuliah"]'::jsonb, 1, null),
    (md5('rampungin-bilingual-18')::uuid, 'pertanyaan', 'Pertanyaan', 'textarea', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-18')::uuid, 'skema', 'Skema', 'textarea', true, null::jsonb, 1, null),
    (md5('rampungin-bilingual-19')::uuid, 'konten', 'Konten', 'text', true, null::jsonb, 0, null),
    (md5('rampungin-bilingual-19')::uuid, 'gaya', 'Gaya', 'checkbox', false, '["Humor","Inspiratif","Edukatif"]'::jsonb, 1, null)
) as f(prompt_id, field_key, label, field_type, required, options, sort_order, placeholder)
join (select id from public.prompts) p on p.id = f.prompt_id;
