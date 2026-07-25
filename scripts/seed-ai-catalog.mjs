/**
 * Catalog: 12 bilingual prompts — simple inputs, rich example outputs, AI cover prompts.
 * Used by scripts/seed-ai-prompts.mjs
 */
import { createHash } from "crypto";

export function seedUuid(key) {
  const hex = createHash("md5").update(`rampungin-ai-seed-${key}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Cover art prompt for Pollinations / Flux-style generators */
function cover(theme) {
  return `Professional marketplace cover illustration, square 1:1, modern flat design, soft blue gradient background, centered icon for ${theme}, clean minimal UI aesthetic, high quality, no text, no watermark`;
}

export const AI_SEED_PROMPTS = [
  {
    key: "ad-copy",
    category: "marketing",
    ai_platform: "all",
    mode: "template",
    title: "Copy iklan 3 variasi",
    title_en: "3-variant ad copy",
    description: "Isi produk + audiens → dapat 3 copy siap pasang.",
    description_en: "Enter product + audience → get 3 ready-to-post ads.",
    tags: ["marketing", "copy", "cta"],
    tags_en: ["marketing", "copy", "cta"],
    coverTheme: "megaphone marketing advertising",
    body:
      "Kamu copywriter performance.\n" +
      "Produk: {{produk}}\nAudiens: {{audiens}}\nNada: {{nada}}\n" +
      "Buat 3 variasi iklan singkat (max 40 kata) + CTA jelas. Format:\n1) ...\n2) ...\n3) ...",
    body_en:
      "You are a performance copywriter.\n" +
      "Product: {{produk}}\nAudience: {{audiens}}\nTone: {{nada}}\n" +
      "Write 3 short ads (max 40 words) + clear CTA. Format:\n1) ...\n2) ...\n3) ...",
    fields: [
      { field_key: "produk", label: "Produk", field_type: "text", required: true, placeholder: "Sepatu lari X", sort_order: 0 },
      { field_key: "audiens", label: "Audiens", field_type: "text", required: true, placeholder: "Pelari pemula", sort_order: 1 },
      { field_key: "nada", label: "Nada", field_type: "radio", required: true, options: ["Formal", "Santai", "Persuasif"], sort_order: 2 },
    ],
    example_input: { produk: "Sepatu lari AeroStep", audiens: "pelari pemula 20–35 th", nada: "Persuasif" },
    example_output_id:
      "1) AeroStep bikin lari pertama terasa ringan. Cushion ekstra, harga ramah. Cobain hari ini — gratis ongkir!\n" +
      "2) Mulai lari tanpa sakit lutut. AeroStep dirancang untuk pemula. Ambil ukuranmu sekarang.\n" +
      "3) Dari sofa ke finish line. AeroStep: grip + nyaman. Pesan sekarang sebelum stok habis.",
    example_output_en:
      "1) AeroStep makes your first runs feel light. Extra cushion, friendly price. Try today — free shipping!\n" +
      "2) Start running without sore knees. AeroStep is built for beginners. Grab your size now.\n" +
      "3) From couch to finish line. AeroStep: grip + comfort. Order before stock runs out.",
  },
  {
    key: "ts-review",
    category: "coding",
    ai_platform: "chatgpt",
    mode: "static",
    title: "Review kode TypeScript",
    title_en: "TypeScript code review",
    description: "Tempel kode → temuan prioritas + saran perbaikan.",
    description_en: "Paste code → prioritized findings + fix tips.",
    tags: ["coding", "typescript", "review"],
    tags_en: ["coding", "typescript", "review"],
    coverTheme: "code brackets developer laptop",
    body:
      "Bertindak sebagai senior engineer TypeScript.\n" +
      "Review cuplikan kode berikut: fokus bug, keamanan, performa, keterbacaan.\n" +
      "Berikan temuan berprioritas (P0/P1/P2) plus saran perbaikan konkret.\n\n[TEMPLEKAN KODE DI SINI]",
    body_en:
      "Act as a senior TypeScript engineer.\n" +
      "Review the code: bugs, security, performance, readability.\n" +
      "Give prioritized findings (P0/P1/P2) and concrete fixes.\n\n[PASTE CODE HERE]",
    fields: [],
    example_input: {},
    example_output_id:
      "P0 — Race condition pada setState async tanpa abort controller.\n" +
      "P1 — `any` di response API menghilangkan type safety; pakai zod parse.\n" +
      "P2 — Nama fungsi `doStuff` tidak deskriptif; rename `fetchUserProfile`.\n" +
      "Saran: tambah unit test untuk error 401/500.",
    example_output_en:
      "P0 — Async setState race without abort controller.\n" +
      "P1 — `any` on API response drops type safety; use zod parse.\n" +
      "P2 — `doStuff` is vague; rename to `fetchUserProfile`.\n" +
      "Tip: add unit tests for 401/500 paths.",
  },
  {
    key: "blog-outline",
    category: "menulis",
    ai_platform: "all",
    mode: "template",
    title: "Outline artikel blog",
    title_en: "Blog article outline",
    description: "Topik + pembaca → kerangka H2/H3 + meta.",
    description_en: "Topic + reader → H2/H3 outline + meta.",
    tags: ["menulis", "seo", "blog"],
    tags_en: ["writing", "seo", "blog"],
    coverTheme: "open notebook pen writing",
    body:
      "Kamu editor konten SEO.\n" +
      "Topik: {{topik}}\nPembaca: {{pembaca}}\nPanjang: {{panjang}}\n" +
      "Buat outline H2/H3 + 1 meta description (max 155 karakter).",
    body_en:
      "You are an SEO content editor.\n" +
      "Topic: {{topik}}\nReader: {{pembaca}}\nLength: {{panjang}}\n" +
      "Create H2/H3 outline + 1 meta description (max 155 chars).",
    fields: [
      { field_key: "topik", label: "Topik", field_type: "text", required: true, placeholder: "Cara tidur lebih nyenyak", sort_order: 0 },
      { field_key: "pembaca", label: "Pembaca", field_type: "text", required: false, placeholder: "Karyawan WFH", sort_order: 1 },
      { field_key: "panjang", label: "Panjang", field_type: "select", required: false, options: ["800 kata", "1200 kata", "1800 kata"], sort_order: 2 },
    ],
    example_input: { topik: "Tidur nyenyak untuk WFH", pembaca: "Karyawan remote", panjang: "1200 kata" },
    example_output_id:
      "H1: Panduan Tidur Nyenyak untuk Karyawan WFH\n" +
      "H2: Mengapa WFH merusak ritme tidur\nH3: Blue light & jadwal tidak tetap\n" +
      "H2: Rutinitas malam 30 menit\nH3: Checklist wind-down\n" +
      "H2: Setup kamar kerja vs kamar tidur\n" +
      "Meta: Tips praktis tidur nyenyak saat WFH: rutinitas malam, batasi layar, dan pisahkan ruang kerja.",
    example_output_en:
      "H1: Sleep Better While Working From Home\n" +
      "H2: Why remote work breaks sleep\nH3: Blue light & irregular schedules\n" +
      "H2: A 30-minute wind-down routine\n" +
      "Meta: Practical WFH sleep tips: evening routine, screen limits, and a clear work/sleep boundary.",
  },
  {
    key: "logo-brief",
    category: "desain",
    ai_platform: "gemini",
    mode: "template",
    title: "Brief logo singkat",
    title_en: "Short logo brief",
    description: "Nama + gaya → brief desain siap kirim ke designer.",
    description_en: "Name + style → design brief ready for a designer.",
    tags: ["desain", "logo", "brief"],
    tags_en: ["design", "logo", "brief"],
    coverTheme: "abstract geometric logo shapes",
    body:
      "Buat brief logo untuk brand {{produk}} bergaya {{gaya}}.\n" +
      "Sertakan: konsep visual, warna (hex), typography mood, do/don't, 3 referensi kata kunci.",
    body_en:
      "Write a logo brief for brand {{produk}} in {{gaya}} style.\n" +
      "Include: visual concept, colors (hex), typography mood, do/don't, 3 keyword references.",
    fields: [
      { field_key: "produk", label: "Brand / Produk", field_type: "text", required: true, placeholder: "Kopi Senja", sort_order: 0 },
      { field_key: "gaya", label: "Gaya", field_type: "select", required: true, options: ["Minimal", "Bold", "Soft"], sort_order: 1 },
    ],
    example_input: { produk: "Kopi Senja", gaya: "Minimal" },
    example_output_id:
      "Konsep: wordmark tipis + ikon cangkir siluet matahari terbenam.\n" +
      "Warna: #1C1917, #F59E0B, #FFF7ED\n" +
      "Type: geometric sans, tracking longgar.\n" +
      "Do: ruang negatif bersih. Don't: gradient ramai / clipart.\n" +
      "Keywords: dusk, calm, craft.",
    example_output_en:
      "Concept: thin wordmark + cup silhouette with sunset arc.\n" +
      "Colors: #1C1917, #F59E0B, #FFF7ED\n" +
      "Type: geometric sans, open tracking.\n" +
      "Do: clean negative space. Don't: busy gradients.\n" +
      "Keywords: dusk, calm, craft.",
  },
  {
    key: "swot",
    category: "bisnis",
    ai_platform: "all",
    mode: "template",
    title: "Analisis SWOT cepat",
    title_en: "Quick SWOT analysis",
    description: "Produk + kompetitor → SWOT + 3 langkah berikutnya.",
    description_en: "Product + competitors → SWOT + 3 next steps.",
    tags: ["bisnis", "swot", "strategi"],
    tags_en: ["business", "swot", "strategy"],
    coverTheme: "strategy chess board abstract",
    body:
      "Analisis SWOT untuk {{produk}} vs kompetitor: {{kompetitor}}.\n" +
      "Tutup dengan 3 langkah prioritas 30 hari.",
    body_en:
      "SWOT for {{produk}} vs competitors: {{kompetitor}}.\n" +
      "End with 3 priority actions for the next 30 days.",
    fields: [
      { field_key: "produk", label: "Produk / bisnis", field_type: "text", required: true, placeholder: "Aplikasi budget", sort_order: 0 },
      { field_key: "kompetitor", label: "Kompetitor", field_type: "text", required: true, placeholder: "A, B, C", sort_order: 1 },
    ],
    example_input: { produk: "App budget Dompetku", kompetitor: "Money Lover, Wallet" },
    example_output_id:
      "S: UX lokal ID, reminder WhatsApp.\nW: Belum ada sync bank.\nO: UMKM butuh laporan pajak sederhana.\nT: Fitur gratis kompetitor agresif.\n" +
      "30 hari: (1) onboarding 3-klik (2) template laporan PPh (3) referral 1-bulan premium.",
    example_output_en:
      "S: Local ID UX, WhatsApp reminders.\nW: No bank sync yet.\nO: SMBs need simple tax reports.\nT: Competitors push free tiers.\n" +
      "30 days: (1) 3-click onboarding (2) tax report template (3) referral month of premium.",
  },
  {
    key: "lesson-plan",
    category: "edukasi",
    ai_platform: "gemini",
    mode: "template",
    title: "Rencana belajar 1 minggu",
    title_en: "1-week lesson plan",
    description: "Materi + level → jadwal harian ringkas.",
    description_en: "Topic + level → compact daily schedule.",
    tags: ["edukasi", "belajar", "rencana"],
    tags_en: ["education", "learning", "plan"],
    coverTheme: "books graduation education",
    body:
      "Buat rencana belajar 7 hari untuk materi {{materi}} level {{level}}.\n" +
      "Tiap hari: tujuan, aktivitas 45 menit, kriteria selesai.",
    body_en:
      "Create a 7-day plan for {{materi}} at {{level}} level.\n" +
      "Each day: goal, 45-min activity, done criteria.",
    fields: [
      { field_key: "materi", label: "Materi", field_type: "text", required: true, placeholder: "Dasar SQL", sort_order: 0 },
      { field_key: "level", label: "Level", field_type: "radio", required: true, options: ["Pemula", "Menengah", "Lanjut"], sort_order: 1 },
    ],
    example_input: { materi: "Dasar SQL", level: "Pemula" },
    example_output_id:
      "Hari 1: SELECT & WHERE — query 10 baris, filter 2 kolom.\n" +
      "Hari 2: ORDER BY & LIMIT — ranking top 5.\n" +
      "Hari 3: JOIN sederhana — 2 tabel.\n…\nHari 7: Mini project laporan penjualan.",
    example_output_en:
      "Day 1: SELECT & WHERE — query 10 rows, filter 2 columns.\n" +
      "Day 2: ORDER BY & LIMIT — top 5 ranking.\n" +
      "Day 3: Simple JOIN — 2 tables.\n…\nDay 7: Mini sales report project.",
  },
  {
    key: "daily-plan",
    category: "produktivitas",
    ai_platform: "chatgpt",
    mode: "template",
    title: "Rencana kerja harian",
    title_en: "Daily work plan",
    description: "Daftar tugas + waktu → jadwal fokus realistis.",
    description_en: "Tasks + timebox → realistic focus schedule.",
    tags: ["produktivitas", "fokus", "todo"],
    tags_en: ["productivity", "focus", "todo"],
    coverTheme: "checklist calendar productivity",
    body:
      "Susun rencana harian dari tugas berikut:\n{{tugas}}\nWaktu tersedia: {{waktu}}\n" +
      "Prioritaskan MIT (Most Important Tasks), sisipkan istirahat, hindari overcommit.",
    body_en:
      "Build a day plan from:\n{{tugas}}\nAvailable time: {{waktu}}\n" +
      "Prioritize MITs, add breaks, avoid overcommit.",
    fields: [
      { field_key: "tugas", label: "Tugas", field_type: "textarea", required: true, placeholder: "satu baris per tugas", sort_order: 0 },
      { field_key: "waktu", label: "Waktu", field_type: "text", required: false, placeholder: "4 jam", sort_order: 1 },
    ],
    example_input: { tugas: "Revisi deck\nEmail klien\nCode review PR", waktu: "4 jam" },
    example_output_id:
      "09:00–10:30 MIT: Revisi deck (deep work)\n10:30–10:45 istirahat\n10:45–11:30 Code review PR\n11:30–12:00 Email klien (batch)\nBuffer 30 mnt untuk overflow.",
    example_output_en:
      "09:00–10:30 MIT: Deck revision (deep work)\n10:30–10:45 break\n10:45–11:30 PR review\n11:30–12:00 Client email (batch)\n30-min overflow buffer.",
  },
  {
    key: "metrics-story",
    category: "data",
    ai_platform: "all",
    mode: "template",
    title: "Cerita dari metrik",
    title_en: "Story from metrics",
    description: "Tempel angka → insight + rekomendasi 3 bullet.",
    description_en: "Paste numbers → insight + 3 bullet recommendations.",
    tags: ["data", "metrik", "insight"],
    tags_en: ["data", "metrics", "insight"],
    coverTheme: "charts graphs analytics dashboard",
    body:
      "Metrik:\n{{metrik}}\nKonteks: {{konteks}}\n" +
      "Tulis insight utama + 3 rekomendasi tindakan (bullet).",
    body_en:
      "Metrics:\n{{metrik}}\nContext: {{konteks}}\n" +
      "Write the key insight + 3 action recommendations (bullets).",
    fields: [
      { field_key: "metrik", label: "Metrik", field_type: "textarea", required: true, placeholder: "MAU 12k → 9.8k", sort_order: 0 },
      { field_key: "konteks", label: "Konteks", field_type: "text", required: true, placeholder: "App fintech Q2", sort_order: 1 },
    ],
    example_input: { metrik: "MAU 12k→9.8k; churn 4%→6.2%; NPS 42→35", konteks: "Fintech Q2 setelah naik harga" },
    example_output_id:
      "Insight: Penurunan MAU selaras kenaikan churn pasca harga — bukan musim sepi.\n" +
      "- Audit onboarding cohort harga baru\n- Tawarkan plan mid-tier 30 hari\n- Survey churn exit (max 2 pertanyaan)",
    example_output_en:
      "Insight: MAU drop tracks churn after pricing — not seasonality.\n" +
      "- Audit onboarding for new-price cohort\n- Offer a 30-day mid-tier plan\n- Run a 2-question exit survey",
  },
  {
    key: "caption-ig",
    category: "hiburan",
    ai_platform: "all",
    mode: "template",
    title: "Caption Instagram",
    title_en: "Instagram caption",
    description: "Konten + gaya → caption + hashtag.",
    description_en: "Content + vibe → caption + hashtags.",
    tags: ["sosmed", "instagram", "caption"],
    tags_en: ["social", "instagram", "caption"],
    coverTheme: "smartphone camera social media",
    body:
      "Buat caption IG untuk: {{konten}}\nGaya: {{gaya}}\n" +
      "Sertakan 1 hook, body 2–3 kalimat, CTA, dan 8 hashtag relevan.",
    body_en:
      "Write an IG caption for: {{konten}}\nVibe: {{gaya}}\n" +
      "Include 1 hook, 2–3 sentence body, CTA, and 8 relevant hashtags.",
    fields: [
      { field_key: "konten", label: "Konten", field_type: "text", required: true, placeholder: "Foto kopi latte art", sort_order: 0 },
      { field_key: "gaya", label: "Gaya", field_type: "checkbox", required: false, options: ["Humor", "Inspiratif", "Edukatif"], sort_order: 1 },
    ],
    example_input: { konten: "Latte art daun di café lokal", gaya: "Humor, Inspiratif" },
    example_output_id:
      "Hook: Kalau daun ini bisa bicara, dia bilang “selamat pagi”.\n" +
      "Body: Latte art kecil, mood besar. Kadang kebahagiaan cuma butuh busa susu yang rapi.\n" +
      "CTA: Tag teman yang butuh caffeine hug.\n" +
      "#kopi #latteart #pagihari #cafelokal #moodbooster #coffeetime #weekendvibes #ngopi",
    example_output_en:
      "Hook: If this leaf could talk, it’d say “good morning.”\n" +
      "Body: Small latte art, big mood. Sometimes joy is just tidy milk foam.\n" +
      "CTA: Tag a friend who needs a caffeine hug.\n" +
      "#coffee #latteart #goodmorning #localcafe #moodbooster #coffeetime #weekendvibes #espresso",
  },
  {
    key: "sql-explain",
    category: "coding",
    ai_platform: "chatgpt",
    mode: "template",
    title: "Jelaskan query SQL",
    title_en: "Explain SQL query",
    description: "Tempel query → penjelasan plain language + risiko.",
    description_en: "Paste query → plain-language explain + risks.",
    tags: ["sql", "database", "coding"],
    tags_en: ["sql", "database", "coding"],
    coverTheme: "database cylinder server",
    body:
      "Jelaskan query berikut untuk pemula:\n{{query}}\n" +
      "Sebutkan apa yang dipilih, join/filter, dan risiko performa jika ada.",
    body_en:
      "Explain this query for beginners:\n{{query}}\n" +
      "Cover what is selected, joins/filters, and any performance risks.",
    fields: [
      { field_key: "query", label: "Query SQL", field_type: "textarea", required: true, placeholder: "SELECT ...", sort_order: 0 },
    ],
    example_input: {
      query: "SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON o.user_id=u.id GROUP BY u.name HAVING COUNT(o.id)>3;",
    },
    example_output_id:
      "Query mengambil nama user dan jumlah order mereka.\n" +
      "LEFT JOIN: user tanpa order tetap muncul (count 0).\n" +
      "HAVING menyaring yang punya >3 order.\n" +
      "Risiko: GROUP BY name bisa bentrok jika nama duplikat — lebih aman group by u.id.",
    example_output_en:
      "Returns each user’s name and order count.\n" +
      "LEFT JOIN keeps users with zero orders.\n" +
      "HAVING filters to >3 orders.\n" +
      "Risk: grouping by name breaks on duplicates — prefer GROUP BY u.id.",
  },
  {
    key: "meeting-notes",
    category: "produktivitas",
    ai_platform: "all",
    mode: "template",
    title: "Ringkas notulen meeting",
    title_en: "Summarize meeting notes",
    description: "Tempel catatan mentah → keputusan + action items.",
    description_en: "Paste raw notes → decisions + action items.",
    tags: ["meeting", "notulen", "action"],
    tags_en: ["meeting", "notes", "action"],
    coverTheme: "people meeting conference table",
    body:
      "Ringkas notulen berikut:\n{{catatan}}\n" +
      "Output: ringkasan 5 baris, keputusan, action items (pemilik + deadline jika ada).",
    body_en:
      "Summarize these notes:\n{{catatan}}\n" +
      "Output: 5-line summary, decisions, action items (owner + deadline if any).",
    fields: [
      { field_key: "catatan", label: "Catatan mentah", field_type: "textarea", required: true, placeholder: "poin-poin meeting", sort_order: 0 },
    ],
    example_input: {
      catatan: "Bahas delay sprint. BE butuh +2 hari. QA mulai Kamis. Launch digeser Senin. Rina update status Slack tiap sore.",
    },
    example_output_id:
      "Ringkasan: Sprint molor; BE +2 hari; QA Kamis; launch Senin; update Slack harian.\n" +
      "Keputusan: Geser launch ke Senin.\n" +
      "Action: BE finish (+2 hari) — Tim BE; QA start Kamis — QA; Slack update sore — Rina.",
    example_output_en:
      "Summary: Sprint slip; BE +2 days; QA Thursday; launch Monday; daily Slack updates.\n" +
      "Decision: Move launch to Monday.\n" +
      "Actions: BE finish (+2d) — BE; QA Thu — QA; Slack PM update — Rina.",
  },
  {
    key: "cold-email",
    category: "marketing",
    ai_platform: "chatgpt",
    mode: "template",
    title: "Cold email singkat",
    title_en: "Short cold email",
    description: "Nama + value prop → email 80–100 kata.",
    description_en: "Name + value prop → 80–100 word email.",
    tags: ["email", "outreach", "sales"],
    tags_en: ["email", "outreach", "sales"],
    coverTheme: "envelope email message",
    body:
      "Tulis cold email ke {{nama}} tentang {{value}}.\n" +
      "Maks 100 kata, 1 CTA, nada {{nada}}.",
    body_en:
      "Write a cold email to {{nama}} about {{value}}.\n" +
      "Max 100 words, 1 CTA, {{nada}} tone.",
    fields: [
      { field_key: "nama", label: "Nama penerima", field_type: "text", required: true, placeholder: "Budi", sort_order: 0 },
      { field_key: "value", label: "Value proposition", field_type: "text", required: true, placeholder: "hemat 5 jam/minggu reporting", sort_order: 1 },
      { field_key: "nada", label: "Nada", field_type: "select", required: true, options: ["Formal", "Hangat", "Tegas"], sort_order: 2 },
    ],
    example_input: { nama: "Budi", value: "otomasi laporan penjualan harian", nada: "Hangat" },
    example_output_id:
      "Subject: Hemat 5 jam laporan tiap minggu?\n\nHai Budi — kami bantu tim sales merapikan laporan harian otomatis dari spreadsheet ke dashboard.\n" +
      "Kalau relevan, boleh saya kirim contoh 2-menit?\n\nSalam,\nAgung",
    example_output_en:
      "Subject: Save 5 hours on weekly reports?\n\nHi Budi — we help sales teams turn daily spreadsheets into an automatic dashboard.\n" +
      "If useful, can I send a 2-minute example?\n\nBest,\nAgung",
  },
].map((p) => ({
  ...p,
  id: seedUuid(p.key),
  cover_prompt: cover(p.coverTheme),
}));
