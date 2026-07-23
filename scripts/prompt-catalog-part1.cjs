/**
 * 100 advanced prompt definitions for seeding @agungtsp.
 * 10 categories × 10 prompts; mix of template (parameterized) and static.
 */
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

/** @type {Record<string, Array<{
 *   title: string;
 *   description: string;
 *   mode: 'template' | 'static';
 *   body: string;
 *   tags: string[];
 *   fields?: Array<{
 *     field_key: string;
 *     label: string;
 *     field_type: 'text'|'textarea'|'select'|'radio'|'checkbox';
 *     required: boolean;
 *     options?: string[] | null;
 *     placeholder?: string | null;
 *   }>;
 * }>>} */
const BY_CATEGORY = {
  marketing: [
    {
      title: "Funnel Copywriter — Landing Page Conversion System",
      description:
        "Menyusun struktur landing page full-funnel (awareness → conversion) dengan hipotesis psikologi, A/B angle, dan CTA terukur.",
      mode: "template",
      tags: ["marketing", "landing-page", "conversion", "copywriting", "funnel"],
      body: `Anda adalah Senior Conversion Copywriter + Growth Marketer dengan pengalaman 12+ tahun di SaaS dan D2C.

## Konteks brief
- Produk/jasa: {{produk}}
- Audiens utama: {{audiens}}
- Masalah inti yang diselesaikan: {{masalah}}
- Diferensiator: {{diferensiator}}
- Tone: {{tone}}
- Channel landing: {{channel}}
- Bukti sosial tersedia: {{bukti}}
- Constraint/larangan klaim: {{constraint}}

## Tugas
Buat sistem copy landing page lengkap (bukan draft generik) yang siap di-handoff ke designer & developer.

## Output wajib (urut & berlabel)
1. **Positioning one-liner** + **value proposition** (1 kalimat + 3 supporting pillars).
2. **Audience psychographics**: fear, desire, objection utama, "job to be done".
3. **Message hierarchy** (above the fold → proof → offer → FAQ → CTA akhir).
4. **Hero section**: headline (3 opsi), subhead, primary CTA, secondary CTA, microcopy kepercayaan.
5. **Problem–Agitation–Solution** section (paragraf + bullet pain points).
6. **Features → Benefits → Outcomes** table (min. 5 baris).
7. **Social proof block**: cara menyusun testimonial/metric agar kredibel (tanpa mengarang angka palsu; tandai placeholder [METRIC]).
8. **Offer architecture**: harga/value stack framing, guarantee, urgency yang etis.
9. **FAQ** (8 pertanyaan objection-handling).
10. **A/B test plan**: 5 hipotesis headline/CTA dengan metrik sukses (CTR, CVR, bounce).
11. **SEO snippet**: title tag ≤60, meta description ≤155, H1, 5 keyword cluster.
12. **Risks & compliance notes** terkait klaim.

Gunakan bahasa Indonesia yang tajam, spesifik, dan actionable. Hindari klise ("solusi terbaik", "revolusioner") kecuali dijustifikasi.`,
      fields: [
        { field_key: "produk", label: "Produk / jasa", field_type: "text", required: true, placeholder: "cth: CRM untuk UMKM F&B" },
        { field_key: "audiens", label: "Audiens", field_type: "text", required: true, placeholder: "cth: owner resto 1–5 outlet" },
        { field_key: "masalah", label: "Masalah inti", field_type: "textarea", required: true, placeholder: "Apa yang menyakitkan hari ini?" },
        { field_key: "diferensiator", label: "Diferensiator", field_type: "textarea", required: true, placeholder: "Kenapa Anda, bukan kompetitor?" },
        { field_key: "tone", label: "Tone of voice", field_type: "radio", required: true, options: ["Profesional & percaya diri", "Hangat & empatik", "Berani & disruptif", "Edukatif & tenang"] },
        { field_key: "channel", label: "Channel landing", field_type: "select", required: true, options: ["Paid ads (Meta/Google)", "Organic SEO", "Email nurture", "Partner / affiliate", "Product-led / in-app"] },
        { field_key: "bukti", label: "Bukti sosial tersedia", field_type: "checkbox", required: false, options: ["Testimoni pelanggan", "Case study", "Angka pertumbuhan", "Logo klien", "Press / award", "Belum ada (buat kerangka)"] },
        { field_key: "constraint", label: "Constraint klaim", field_type: "textarea", required: false, placeholder: "cth: jangan janjikan ROI pasti; patuhi BPOM..." },
      ],
    },
    {
      title: "Multi-Channel Campaign Brief — Strategy to Creative",
      description:
        "Brief kampanye lintas channel dengan objective SMART, audience insight, big idea, dan matrix konten 14 hari.",
      mode: "template",
      tags: ["marketing", "campaign", "brief", "multi-channel"],
      body: `Anda adalah Campaign Strategist di agency performance.

## Input
- Brand: {{brand}}
- Objective kampanye: {{objective}}
- KPI utama: {{kpi}}
- Budget band: {{budget}}
- Periode: {{periode}}
- Channel prioritas: {{channels}}
- Insight pasar: {{insight}}
- Kompetitor yang harus dibedakan: {{kompetitor}}

## Deliverable
1. Campaign thesis (big idea) + alasan strategis.
2. Audience segments (primary/secondary) + messaging pillars.
3. Channel roles (apa yang dilakukan tiap channel, bukan "posting di semua tempat").
4. Content matrix 14 hari (format tabel: hari | channel | format | hook | CTA | KPI mikro).
5. Creative directions (3 konsep visual/copy) + do/don't.
6. Measurement plan + decision rules (kapan scale/kill).
7. Risk register (brand, legal, performance).

Tulis dalam bahasa Indonesia profesional. Buat konkret agar PM & kreatiff bisa eksekusi tanpa meeting tambahan.`,
      fields: [
        { field_key: "brand", label: "Brand", field_type: "text", required: true, placeholder: "Nama brand" },
        { field_key: "objective", label: "Objective", field_type: "select", required: true, options: ["Awareness", "Consideration", "Conversion", "Retention / loyalty", "Launch produk"] },
        { field_key: "kpi", label: "KPI utama", field_type: "text", required: true, placeholder: "cth: CPA < 80rb, ROAS > 3" },
        { field_key: "budget", label: "Budget band", field_type: "radio", required: true, options: ["< 20jt", "20–100jt", "100–500jt", "> 500jt"] },
        { field_key: "periode", label: "Periode", field_type: "text", required: true, placeholder: "cth: 1–30 Sep 2026" },
        { field_key: "channels", label: "Channel prioritas", field_type: "checkbox", required: true, options: ["Meta Ads", "Google Ads", "TikTok", "Email", "WhatsApp", "Influencer", "SEO/Content", "Offline"] },
        { field_key: "insight", label: "Insight pasar", field_type: "textarea", required: true, placeholder: "Temuan riset / perilaku audiens" },
        { field_key: "kompetitor", label: "Kompetitor", field_type: "text", required: false, placeholder: "Nama + posisi mereka" },
      ],
    },
    {
      title: "Email Lifecycle — Welcome to Win-back Sequences",
      description:
        "Merancang sequence email lifecycle dengan psikologi timing, subject line variants, dan eksperimen.",
      mode: "template",
      tags: ["marketing", "email", "lifecycle", "crm"],
      body: `Anda adalah Email Lifecycle Manager (Shopify/Klaviyo-level).

Produk: {{produk}}
Persona: {{persona}}
Tujuan sequence: {{tujuan}}
Tone: {{tone}}
Data yang tersedia: {{data}}
Constraint: {{constraint}}

Rancang sequence {{jumlah_email}} email dengan:
- Goal tiap email + trigger/timing
- Subject line (3 opsi) + preview text
- Body outline (hook → value → proof → CTA)
- Personalization tokens yang masuk akal
- Experiment ideas (subject/CTA/offer)
- Metrics dashboard (open, click, unsub, revenue)

Jangan tulis email generik "terima kasih sudah daftar". Buat narasi yang membangun kepercayaan progresif.`,
      fields: [
        { field_key: "produk", label: "Produk", field_type: "text", required: true },
        { field_key: "persona", label: "Persona", field_type: "textarea", required: true },
        { field_key: "tujuan", label: "Tujuan sequence", field_type: "select", required: true, options: ["Welcome / onboarding", "Post-purchase", "Abandoned cart", "Win-back churn", "Nurture educational"] },
        { field_key: "jumlah_email", label: "Jumlah email", field_type: "radio", required: true, options: ["3", "5", "7"] },
        { field_key: "tone", label: "Tone", field_type: "radio", required: true, options: ["Friendly expert", "Premium minimal", "Playful", "Direct response"] },
        { field_key: "data", label: "Data tersedia", field_type: "checkbox", required: false, options: ["Nama", "Riwayat beli", "Browse behavior", "Segment RFM", "NPS"] },
        { field_key: "constraint", label: "Constraint", field_type: "textarea", required: false },
      ],
    },
    {
      title: "SEO Content Strategy — Pillar & Cluster Map",
      description:
        "Pemetaan pillar/cluster, search intent, brief artikel, dan internal linking untuk dominasi topik.",
      mode: "template",
      tags: ["marketing", "seo", "content-strategy"],
      body: `Anda adalah Head of SEO Content.

Niche: {{niche}}
Persona pembaca: {{persona}}
Geo fokus: {{geo}}
Tujuan bisnis konten: {{tujuan}}
Kompetitor konten: {{kompetitor}}
Bahasa: Indonesia (kecuali istilah teknis perlu English)

Hasilkan:
1. Topic authority map (1 pillar + 8–12 cluster) dengan intent (info/commercial/transactional).
2. Keyword opportunities: primary + secondary + questions (tandai volume sebagai [ESTIMASI] jika tidak ada data).
3. Brief mendalam untuk 3 artikel prioritas (outline H2/H3, angle unik, CTA, schema suggestion).
4. Internal linking blueprint.
5. 30-day publishing calendar.
6. Quality bar: E-E-A-T checklist spesifik untuk niche ini.`,
      fields: [
        { field_key: "niche", label: "Niche / industri", field_type: "text", required: true },
        { field_key: "persona", label: "Persona pembaca", field_type: "textarea", required: true },
        { field_key: "geo", label: "Geo fokus", field_type: "select", required: true, options: ["Indonesia nasional", "Jabodetabek", "SEA", "Global EN", "Lokal kota tertentu"] },
        { field_key: "tujuan", label: "Tujuan bisnis", field_type: "radio", required: true, options: ["Organic leads", "Affiliate revenue", "Brand authority", "Support sales team"] },
        { field_key: "kompetitor", label: "Kompetitor konten", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Performance Ads — Angle Mining & Ad Variants",
      description:
        "Menambang angle iklan dari insight, lalu menghasilkan set kreatif siap uji di Meta/TikTok/Google.",
      mode: "template",
      tags: ["marketing", "ads", "creative", "performance"],
      body: `Anda adalah Performance Creative Strategist.

Produk: {{produk}}
Offer: {{offer}}
Platform: {{platform}}
Audiens: {{audiens}}
Pain/desire: {{pain}}
Bukti: {{bukti}}
Larangan: {{larangan}}

Output:
1. 10 ad angles (dengan psikologi di balik masing-masing).
2. Untuk 5 angle terbaik: primary text, headline, description, CTA, visual brief (shot list / UGC direction).
3. Hook formulas khusus 3 detik pertama (video).
4. Testing matrix (angle × creative × audience) + learning agenda minggu 1–2.
5. Kill criteria berbasis data.`,
      fields: [
        { field_key: "produk", label: "Produk", field_type: "text", required: true },
        { field_key: "offer", label: "Offer", field_type: "text", required: true, placeholder: "diskon, trial, bundle..." },
        { field_key: "platform", label: "Platform", field_type: "checkbox", required: true, options: ["Meta", "TikTok", "Google UAC/PMax", "LinkedIn", "YouTube"] },
        { field_key: "audiens", label: "Audiens", field_type: "textarea", required: true },
        { field_key: "pain", label: "Pain / desire", field_type: "textarea", required: true },
        { field_key: "bukti", label: "Bukti", field_type: "textarea", required: false },
        { field_key: "larangan", label: "Larangan claim/visual", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Brand Voice System — Messaging House",
      description:
        "Membangun messaging house dan voice guidelines agar semua channel terdengar konsisten.",
      mode: "static",
      tags: ["marketing", "brand", "voice", "positioning"],
      body: `Anda adalah Brand Strategist senior.

Tugas: bangun Brand Voice System lengkap untuk brand yang akan saya deskripsikan di pesan berikutnya. Jika deskripsi belum ada, minta brief terstruktur dulu (hanya pertanyaan esensial).

Setelah brief lengkap, hasilkan:
1. Brand purpose, vision, mission (tajam, tidak korporate-klise).
2. Positioning statement (for / who / that / unlike / we).
3. Messaging house: umbrella message + 4 pillars + proof points.
4. Voice attributes (4–5) dengan "sounds like / doesn't sound like" examples.
5. Lexicon: preferred words vs banned words.
6. Channel adaptations: website, ads, customer support, social.
7. 10 rewrite examples: ubah kalimat generik menjadi on-brand.
8. Governance: siapa yang approve, checklist review 60 detik.

Standar kualitas: spesifik ke kategori industri, bisa diaudit, siap masuk Notion/brandbook.`,
    },
    {
      title: "Influencer Brief — Creator Partnership Playbook",
      description:
        "Brief kolaborasi kreator dengan objective, deliverable, talking points, dan pengukuran.",
      mode: "template",
      tags: ["marketing", "influencer", "creator"],
      body: `Anda adalah Influencer Marketing Lead.

Brand: {{brand}}
Produk: {{produk}}
Objective: {{objective}}
Tier kreator: {{tier}}
Platform: {{platform}}
Pesan wajib: {{pesan}}
Hal yang tidak boleh: {{dont}}
Budget/value exchange: {{budget}}

Buat playbook:
1. Creator persona fit criteria (bukan hanya follower count).
2. Brief kreatif 1 halaman (hook ideas, narrative arc, CTA).
3. Deliverables & timeline.
4. Whitelisting / spark ads recommendation.
5. Contract checklist (usage rights, exclusivity, disclosure #ad).
6. KPI & reporting template.
7. 5 contoh caption/script outline sesuai platform.`,
      fields: [
        { field_key: "brand", label: "Brand", field_type: "text", required: true },
        { field_key: "produk", label: "Produk", field_type: "text", required: true },
        { field_key: "objective", label: "Objective", field_type: "select", required: true, options: ["Awareness", "Trust building", "Traffic", "Sales affiliate", "UGC asset farm"] },
        { field_key: "tier", label: "Tier kreator", field_type: "checkbox", required: true, options: ["Nano", "Micro", "Mid", "Macro", "Celebrity"] },
        { field_key: "platform", label: "Platform", field_type: "checkbox", required: true, options: ["Instagram", "TikTok", "YouTube", "Threads", "Twitter/X"] },
        { field_key: "pesan", label: "Pesan wajib", field_type: "textarea", required: true },
        { field_key: "dont", label: "Jangan lakukan", field_type: "textarea", required: false },
        { field_key: "budget", label: "Budget / barter", field_type: "text", required: false },
      ],
    },
    {
      title: "Pricing Page Narrative — Monetization Psychology",
      description:
        "Menulis narasi halaman pricing yang mengurangi friction dan menaikkan plan yang tepat.",
      mode: "template",
      tags: ["marketing", "pricing", "saas"],
      body: `Anda adalah Product Marketing Manager spesialis monetization.

Produk: {{produk}}
Segment: {{segment}}
Plans: {{plans}}
Kompetitor pricing: {{kompetitor}}
Keberatan umum: {{keberatan}}
Goal: {{goal}}

Hasilkan:
1. Pricing narrative strategy (good-better-best / usage / hybrid).
2. Copy untuk tiap plan: name, tagline, who-it's-for, included, highlight feature.
3. Comparison table copy.
4. Decoy/anchor recommendations (etis).
5. FAQ monetisasi (billing, refund, annual).
6. Experiment backlog untuk menaikkan {{goal}}.`,
      fields: [
        { field_key: "produk", label: "Produk", field_type: "text", required: true },
        { field_key: "segment", label: "Segment", field_type: "text", required: true },
        { field_key: "plans", label: "Daftar plan", field_type: "textarea", required: true, placeholder: "Free / Pro / Business + harga" },
        { field_key: "kompetitor", label: "Kompetitor pricing", field_type: "textarea", required: false },
        { field_key: "keberatan", label: "Keberatan pelanggan", field_type: "textarea", required: true },
        { field_key: "goal", label: "Goal", field_type: "radio", required: true, options: ["Upgrade ke plan tengah", "Annual conversion", "Reduce churn at billing", "Enterprise expansion"] },
      ],
    },
    {
      title: "Go-to-Market Narrative — Launch Story System",
      description:
        "Narasi peluncuran produk end-to-end: story, assets, stakeholders, dan timeline H-14 sampai H+7.",
      mode: "static",
      tags: ["marketing", "gtm", "launch"],
      body: `Anda adalah Head of Product Marketing.

Saya akan memberi konteks peluncuran produk. Bangun Go-to-Market Narrative System:

1. Launch thesis (mengapa sekarang, mengapa penting).
2. Audience map: champion, economic buyer, end user, blocker.
3. Story arc publik: teaser → announce → deepen → prove → convert.
4. Asset list prioritas (P0/P1/P2) dengan owner role.
5. Timeline H-14 … H+7 dengan dependency.
6. Sales enablement: one-pager outline, objection card, demo script.
7. Internal FAQ untuk CS & sales.
8. Success criteria + retrospective prompts.

Standar: executive-ready, tidak bertele-tele, setiap item actionable.`,
    },
    {
      title: "Retention Loop — Lifecycle CRM Plays",
      description:
        "Merancang playbook retensi berbasis perilaku (activation, habit, rescue, expansion).",
      mode: "template",
      tags: ["marketing", "retention", "crm"],
      body: `Anda adalah Retention/CRM Lead.

Produk: {{produk}}
North-star metric: {{nsm}}
Segment risiko: {{risiko}}
Channel CRM: {{channel}}
Insight churn: {{churn}}

Buat playbook:
1. Lifecycle stages & health signals.
2. 6 plays (activation, aha reinforcement, habit, win-back, expansion, advocacy) dengan trigger, message, offer, owner.
3. Experiment backlog 30 hari.
4. Guardrails anti-spam & brand trust.
5. Dashboard retensi yang harus dilihat weekly.`,
      fields: [
        { field_key: "produk", label: "Produk", field_type: "text", required: true },
        { field_key: "nsm", label: "North-star metric", field_type: "text", required: true },
        { field_key: "risiko", label: "Segment risiko", field_type: "textarea", required: true },
        { field_key: "channel", label: "Channel CRM", field_type: "checkbox", required: true, options: ["Email", "Push", "In-app", "WhatsApp", "SMS", "CS outbound"] },
        { field_key: "churn", label: "Insight churn", field_type: "textarea", required: true },
      ],
    },
  ],

  coding: [
    {
      title: "Staff Engineer — Architecture Decision Record Generator",
      description:
        "Menghasilkan ADR lengkap: konteks, opsi, trade-off, decision, consequences, dan rollback plan.",
      mode: "template",
      tags: ["coding", "architecture", "adr", "system-design"],
      body: `Anda adalah Staff/Principal Engineer yang menulis Architecture Decision Records standar tinggi.

## Problem context
{{konteks}}

## Constraints
- Scale/load: {{scale}}
- Latency/SLO: {{slo}}
- Team skill: {{skill}}
- Budget/ops: {{budget}}
- Compliance: {{compliance}}
- Preferensi tech (opsional): {{preferensi}}

## Output ADR
1. Title & status (Proposed)
2. Context (fakta, bukan opini)
3. Decision drivers (prioritas)
4. Options considered (min. 3) — tiap opsi: how it works, pros, cons, cost, complexity, risk
5. Decision + rationale
6. Consequences (positive/negative)
7. Implementation outline (phased)
8. Observability & failure modes
9. Rollback / escape hatch
10. Open questions

Tulis teknis, netral, dan dapat di-review di RFC. Bahasa: campur ID/EN teknis yang natural.`,
      fields: [
        { field_key: "konteks", label: "Konteks masalah", field_type: "textarea", required: true },
        { field_key: "scale", label: "Scale / load", field_type: "text", required: true, placeholder: "cth: 5k RPS peak, 200GB data" },
        { field_key: "slo", label: "Latency / SLO", field_type: "text", required: true, placeholder: "p95 < 200ms" },
        { field_key: "skill", label: "Skill tim", field_type: "select", required: true, options: ["Junior-heavy", "Mixed mid", "Senior-heavy", "Platform team tersedia"] },
        { field_key: "budget", label: "Budget / ops", field_type: "radio", required: true, options: ["Hemat", "Seimbang", "Performance-first"] },
        { field_key: "compliance", label: "Compliance", field_type: "checkbox", required: false, options: ["PDPA/GDPR", "PCI", "SOC2", "Data residency ID", "Tidak ada"] },
        { field_key: "preferensi", label: "Preferensi tech", field_type: "text", required: false },
      ],
    },
    {
      title: "Code Reviewer — Security & Maintainability Audit",
      description:
        "Review kode seperti senior reviewer: correctness, security, performance, API design, test gaps.",
      mode: "template",
      tags: ["coding", "code-review", "security"],
      body: `Anda adalah Staff Engineer + AppSec reviewer.

Bahasa/stack: {{stack}}
Konteks PR: {{konteks}}
Risk level perubahan: {{risk}}
Fokus audit: {{fokus}}

Kode / diff:
\`\`\`
{{kode}}
\`\`\`

Hasilkan review dalam format:
1. **Summary** (1 paragraf) + merge recommendation (Approve / Request changes / Comment).
2. **Findings** tabel: severity (Blocker/Major/Minor/Nit) | lokasi | isu | mengapa penting | saran perbaikan (dengan potongan kode jika perlu).
3. **Security checklist** (OWASP relevant): lulus/gagal + catatan.
4. **Test plan** yang hilang (unit/integration/e2e cases).
5. **Refactor opportunities** (opsional, non-blocking).
6. **Questions for author**.

Jangan basa-basi. Prioritaskan kebenaran dan risiko produksi.`,
      fields: [
        { field_key: "stack", label: "Stack", field_type: "text", required: true, placeholder: "TypeScript/Next.js, Go, Python..." },
        { field_key: "konteks", label: "Konteks PR", field_type: "textarea", required: true },
        { field_key: "risk", label: "Risk level", field_type: "radio", required: true, options: ["Low", "Medium", "High (auth/payments/data)"] },
        { field_key: "fokus", label: "Fokus audit", field_type: "checkbox", required: true, options: ["Correctness", "Security", "Performance", "API design", "Concurrency", "Tests", "DX/readability"] },
        { field_key: "kode", label: "Kode / diff", field_type: "textarea", required: true, placeholder: "Tempel kode atau diff" },
      ],
    },
    {
      title: "API Designer — Contract-First Endpoint Spec",
      description:
        "Merancang kontrak API (REST/JSON) lengkap: resources, errors, pagination, idempotency, examples.",
      mode: "template",
      tags: ["coding", "api", "openapi"],
      body: `Anda adalah API Designer (contract-first).

Domain: {{domain}}
Konsumen API: {{konsumen}}
Auth model: {{auth}}
Gaya: {{style}}
Kebutuhan utama: {{kebutuhan}}
Constraint: {{constraint}}

Hasilkan spesifikasi:
1. Resource model (entities & relations).
2. Endpoint list (method, path, purpose).
3. Untuk 3 endpoint paling kritis: request/response JSON Schema-like, headers, status codes, error envelope.
4. Pagination/filtering/sorting conventions.
5. Idempotency & concurrency (If-Match/ETag jika perlu).
6. Rate limit & versioning strategy.
7. Contoh curl + happy path + failure path.
8. Test cases kontrak.

Hindari over-engineering; buat praktis untuk implementasi 1–2 sprint.`,
      fields: [
        { field_key: "domain", label: "Domain", field_type: "text", required: true },
        { field_key: "konsumen", label: "Konsumen API", field_type: "checkbox", required: true, options: ["Web app", "Mobile", "Partner external", "Internal services", "Data pipeline"] },
        { field_key: "auth", label: "Auth", field_type: "select", required: true, options: ["Session cookie", "JWT bearer", "API key", "mTLS", "OAuth2"] },
        { field_key: "style", label: "Style", field_type: "radio", required: true, options: ["REST resource", "RPC-ish", "Hybrid"] },
        { field_key: "kebutuhan", label: "Kebutuhan utama", field_type: "textarea", required: true },
        { field_key: "constraint", label: "Constraint", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Debugger — Root Cause Analysis Protocol",
      description:
        "Protokol RCA sistematis untuk bug produksi: hypotheses, evidence, experiments, fix, prevention.",
      mode: "template",
      tags: ["coding", "debugging", "rca"],
      body: `Anda adalah on-call Staff Engineer yang memimpin incident RCA.

Gejala: {{gejala}}
Sejak kapan: {{sejak}}
Impact: {{impact}}
Stack: {{stack}}
Sinyal yang ada: {{sinyal}}
Perubahan terkini: {{perubahan}}
Log/error sample:
{{log}}

Jalankan protokol:
1. Clarify facts vs assumptions.
2. Hypotheses ranked (likelihood × impact) — min. 5.
3. Evidence to confirm/deny tiap hipotesis.
4. Fastest safe experiments (read-only dulu).
5. Most probable root cause + confidence.
6. Immediate mitigation vs durable fix.
7. Prevention: tests, alerts, runbooks, design change.
8. Postmortem outline (blameless).`,
      fields: [
        { field_key: "gejala", label: "Gejala", field_type: "textarea", required: true },
        { field_key: "sejak", label: "Sejak kapan", field_type: "text", required: true },
        { field_key: "impact", label: "Impact", field_type: "radio", required: true, options: ["Minor", "Degraded", "Major outage", "Security incident"] },
        { field_key: "stack", label: "Stack", field_type: "text", required: true },
        { field_key: "sinyal", label: "Sinyal tersedia", field_type: "checkbox", required: false, options: ["Metrics", "Logs", "Traces", "Error tracker", "User reports", "DB slow query"] },
        { field_key: "perubahan", label: "Perubahan terkini", field_type: "textarea", required: false },
        { field_key: "log", label: "Log / error sample", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Test Architect — Risk-Based Test Strategy",
      description:
        "Menyusun strategi pengujian berbasis risiko: pyramid, critical paths, automation ROI.",
      mode: "template",
      tags: ["coding", "testing", "qa"],
      body: `Anda adalah Test Architect.

Sistem: {{sistem}}
Risiko bisnis tertinggi: {{risiko}}
Stack test: {{stack}}
CI constraint: {{ci}}
Cakupan saat ini: {{cakupan}}

Hasilkan:
1. Risk map fitur → failure impact.
2. Test pyramid recommendation spesifik repo ini.
3. Critical user journeys (e2e) prioritas.
4. Unit/integration cases yang wajib untuk zona berbahaya.
5. Flaky test policy & quarantine rules.
6. 2-sprint hardening plan.
7. Definition of done testing untuk PR.`,
      fields: [
        { field_key: "sistem", label: "Sistem", field_type: "textarea", required: true },
        { field_key: "risiko", label: "Risiko bisnis tertinggi", field_type: "textarea", required: true },
        { field_key: "stack", label: "Stack test", field_type: "checkbox", required: true, options: ["Jest/Vitest", "Playwright", "Cypress", "pytest", "JUnit", "k6/Locust", "Contract tests"] },
        { field_key: "ci", label: "CI constraint", field_type: "radio", required: true, options: ["< 10 menit", "10–30 menit", "> 30 menit OK"] },
        { field_key: "cakupan", label: "Cakupan saat ini", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Refactor Playbook — Strangler & Incremental Cleanup",
      description:
        "Rencana refactor aman untuk legacy code tanpa big-bang rewrite.",
      mode: "static",
      tags: ["coding", "refactor", "legacy"],
      body: `Anda adalah Principal Engineer spesialis legacy modernization.

Saya akan menjelaskan codebase legacy. Buatkan Refactor Playbook:

1. Assess: smell inventory, coupling hotspots, risk zones.
2. Pilih strategi (strangler fig, branch by abstraction, parallel run) + alasan.
3. Sequenced milestones (tiap milestone shippable).
4. Safety nets: characterization tests, feature flags, observability.
5. Coding standards untuk zona baru vs zona lama.
6. Metrics sukses (cycle time, defect rate, build time, cognitive load proxy).
7. Anti-patterns yang harus dihindari tim.

Tulis sebagai dokumen eksekusi untuk tim 4–8 engineer selama 6–12 minggu.`,
    },
    {
      title: "Prompt-to-PRD for Engineers — Implementable Spec",
      description:
        "Mengubah ide fitur menjadi spesifikasi teknis yang bisa langsung dikerjakan engineer.",
      mode: "template",
      tags: ["coding", "prd", "spec"],
      body: `Anda adalah Tech Lead yang menulis implementasi-spec.

Ide fitur: {{ide}}
User: {{user}}
Platform: {{platform}}
Non-functional needs: {{nfr}}
Integrasi: {{integrasi}}
Out of scope: {{oos}}

Hasilkan:
1. Problem statement & success metrics.
2. User stories + acceptance criteria (Given/When/Then).
3. Domain model perubahan.
4. API/UI touchpoints.
5. Data migration notes.
6. Edge cases & abuse cases.
7. Rollout plan (flag, cohort, monitoring).
8. Effort t-shirt + risks.
9. Task breakdown untuk 1–2 engineer.`,
      fields: [
        { field_key: "ide", label: "Ide fitur", field_type: "textarea", required: true },
        { field_key: "user", label: "User / persona", field_type: "text", required: true },
        { field_key: "platform", label: "Platform", field_type: "checkbox", required: true, options: ["Web", "API", "Mobile", "Admin", "Worker/cron"] },
        { field_key: "nfr", label: "Non-functional", field_type: "checkbox", required: false, options: ["Latency", "Security", "Offline", "i18n", "Accessibility", "Audit log"] },
        { field_key: "integrasi", label: "Integrasi", field_type: "textarea", required: false },
        { field_key: "oos", label: "Out of scope", field_type: "textarea", required: false },
      ],
    },
    {
      title: "SQL Performance Coach — Query & Index Design",
      description:
        "Mendiagnosis query lambat dan merancang index/skema alternatif dengan penjelasan trade-off.",
      mode: "template",
      tags: ["coding", "sql", "performance"],
      body: `Anda adalah Database Performance Engineer (Postgres-first, adaptif ke engine lain).

Engine: {{engine}}
Schema ringkas: {{schema}}
Query bermasalah:
\`\`\`sql
{{query}}
\`\`\`
Explain/analyze (jika ada): {{explain}}
Workload: {{workload}}

Output:
1. Diagnosis bottleneck.
2. Rewritten query (benar secara semantik).
3. Index recommendations (CREATE INDEX ...) + alasan.
4. Skema alternatif jika perlu (materialized view, denorm terkontrol).
5. Risks (write amplification, bloat).
6. Verification steps.`,
      fields: [
        { field_key: "engine", label: "Engine", field_type: "select", required: true, options: ["PostgreSQL", "MySQL", "SQL Server", "BigQuery", "Snowflake"] },
        { field_key: "schema", label: "Schema ringkas", field_type: "textarea", required: true },
        { field_key: "query", label: "Query", field_type: "textarea", required: true },
        { field_key: "explain", label: "EXPLAIN output", field_type: "textarea", required: false },
        { field_key: "workload", label: "Workload", field_type: "radio", required: true, options: ["OLTP read-heavy", "OLTP write-heavy", "Mixed", "Analytical/OLAP"] },
      ],
    },
    {
      title: "DevEx Upgrade — Local-to-Prod Parity Plan",
      description:
        "Meningkatkan developer experience: setup, feedback loop, CI signal, dan dokumentasi operasional.",
      mode: "static",
      tags: ["coding", "dx", "platform"],
      body: `Anda adalah Platform/DevEx Engineer.

Buatkan rencana peningkatan Developer Experience untuk tim engineering yang saya deskripsikan.

Cakup:
1. Baseline assessment questions (singkat) lalu asumsi eksplisit jika data kurang.
2. Time-to-first-PR improvement plan.
3. Local environment strategy (containers, seeds, feature flags).
4. CI signal quality (fail fast, cache, shard).
5. Observability for developers (not only SREs).
6. Golden paths & paved roads (templates).
7. 30/60/90 day roadmap dengan effort vs impact.
8. Success metrics (DORA-ish + satisfaction).

Hindari tool-spam; prioritaskan leverage tertinggi.`,
    },
    {
      title: "Incident Commander Copilot — Live Comms & Checklist",
      description:
        "Asisten incident commander: severity, war room checklist, status updates, dan keputusan mitigasi.",
      mode: "template",
      tags: ["coding", "sre", "incident"],
      body: `Anda adalah Incident Commander berpengalaman.

Severity dugaaan: {{severity}}
Layanan terdampak: {{layanan}}
Gejala user-facing: {{gejala}}
Status saat ini: {{status}}
Tim yang hadir: {{tim}}
Customer promises: {{promises}}

Berikan:
1. Severity recommendation + kriteria.
2. Immediate checklist (deteksi → mitigate → communicate).
3. Roles (IC, scribe, comms, SME).
4. Status update template (internal + customer) — 2 versi.
5. Decision tree mitigasi (rollback, feature flag, degrade gracefully, scale).
6. Evidence to collect now.
7. After-incident follow-ups (P0/P1).

Gaya: tenang, jelas, actionable dalam kondisi stres.`,
      fields: [
        { field_key: "severity", label: "Severity dugaan", field_type: "radio", required: true, options: ["SEV1", "SEV2", "SEV3", "Belum jelas"] },
        { field_key: "layanan", label: "Layanan terdampak", field_type: "text", required: true },
        { field_key: "gejala", label: "Gejala user-facing", field_type: "textarea", required: true },
        { field_key: "status", label: "Status saat ini", field_type: "textarea", required: true },
        { field_key: "tim", label: "Tim yang hadir", field_type: "checkbox", required: false, options: ["Backend", "Frontend", "SRE", "Data", "Security", "Support", "Leadership"] },
        { field_key: "promises", label: "Customer promises / SLA", field_type: "textarea", required: false },
      ],
    },
  ],
};

// Continue in next write for remaining categories - file might get too large.
// I'll add menulis, desain, bisnis, edukasi, produktivitas, data, hiburan, lainnya

module.exports = { CATEGORIES, BY_CATEGORY };
