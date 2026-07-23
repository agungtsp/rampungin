const { CATEGORIES, BY_CATEGORY: PART1 } = require("./prompt-catalog-part1.cjs");

/** @type {typeof PART1} */
const REST = {
  menulis: [
    {
      title: "Longform Narrative Architect — Essay & Report System",
      description: "Kerangka tulisan panjang dengan thesis, evidence ladder, counterargument, dan ending yang memorable.",
      mode: "template",
      tags: ["menulis", "essay", "longform", "editorial"],
      body: `Anda adalah Editor senior + Narrative Architect (The Atlantic / Kompas level).

Topik: {{topik}}
Tujuan tulisan: {{tujuan}}
Pembaca: {{pembaca}}
Panjang target: {{panjang}}
Sudut pandang: {{sudut}}
Bukti yang dimiliki: {{bukti}}
Tone: {{tone}}
Larangan: {{larangan}}

Hasilkan paket menulis:
1. Working thesis (tajam, bisa disanggah).
2. Promise to reader (apa yang berubah setelah membaca).
3. Outline H2/H3 dengan fungsi tiap bagian (hook/context/evidence/turn/payoff).
4. Evidence ladder: claim → data/anecdote → meaning.
5. Counterargument section + rebuttal.
6. Opening 3 alternatif (anecdote / surprising fact / provocative question).
7. Closing 2 alternatif (callback / call-to-think / call-to-act).
8. Style notes: ritme kalimat, jargon yang boleh, metafora yang dihindari.
9. Checklist self-edit sebelum publish.

Jangan menghasilkan tulisan generik. Buat kerangka yang memaksa kedalaman.`,
      fields: [
        { field_key: "topik", label: "Topik", field_type: "text", required: true },
        { field_key: "tujuan", label: "Tujuan", field_type: "select", required: true, options: ["Persuasi", "Eksplanasi", "Investigasi", "Opini berbasis data", "Storytelling personal"] },
        { field_key: "pembaca", label: "Pembaca", field_type: "text", required: true },
        { field_key: "panjang", label: "Panjang", field_type: "radio", required: true, options: ["800–1200 kata", "1500–2500", "3000+"] },
        { field_key: "sudut", label: "Sudut pandang", field_type: "radio", required: true, options: ["First person", "Third person close", "Editorial omniscient"] },
        { field_key: "bukti", label: "Bukti tersedia", field_type: "textarea", required: false },
        { field_key: "tone", label: "Tone", field_type: "checkbox", required: true, options: ["Analitis", "Empatik", "Provokatif", "Tenang", "Literer"] },
        { field_key: "larangan", label: "Larangan", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Ghostwriter Eksekutif — Pidato & Memo Berbobot",
      description: "Menulis pidato/memo eksekutif dengan pesan inti, cerita, dan call-to-action yang tepat audiens.",
      mode: "template",
      tags: ["menulis", "pidato", "executive", "ghostwriting"],
      body: `Anda adalah executive ghostwriter.

Pembicara/penulis: {{pembicara}}
Acara/konteks: {{konteks}}
Audiens: {{audiens}}
Pesan inti (satu kalimat): {{pesan}}
Durasi/panjang: {{durasi}}
Emosi yang ingin dibangkitkan: {{emosi}}
Fakta wajib: {{fakta}}
Yang tidak boleh disinggung: {{tabu}}

Deliverable:
1. Message house (inti + 3 supporting points).
2. Full draft dengan stage directions ringan (pause / emphasis).
3. Anecdote suggestions (jika fakta kurang, tandai [PERLU CERITA ASLI]).
4. Q&A antisipasi (8 pertanyaan sulit + jawaban kerangka).
5. Versi singkat 60 detik (elevator).
6. Versi memo tertulis 1 halaman.`,
      fields: [
        { field_key: "pembicara", label: "Pembicara", field_type: "text", required: true },
        { field_key: "konteks", label: "Konteks acara", field_type: "textarea", required: true },
        { field_key: "audiens", label: "Audiens", field_type: "text", required: true },
        { field_key: "pesan", label: "Pesan inti", field_type: "text", required: true },
        { field_key: "durasi", label: "Durasi", field_type: "radio", required: true, options: ["3 menit", "7 menit", "15 menit", "Memo 1 halaman"] },
        { field_key: "emosi", label: "Emosi target", field_type: "checkbox", required: true, options: ["Optimisme", "Urgensi", "Kepercayaan", "Haru", "Kebanggaan", "Ketenangan"] },
        { field_key: "fakta", label: "Fakta wajib", field_type: "textarea", required: false },
        { field_key: "tabu", label: "Tabu", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Editorial Rewriter — Clarity, Punch, Integrity",
      description: "Rewrite naskah agar lebih jernih dan kuat tanpa mengorbankan makna atau etika.",
      mode: "template",
      tags: ["menulis", "editing", "rewrite"],
      body: `Anda adalah developmental + line editor.

Tujuan rewrite: {{tujuan}}
Audiens: {{audiens}}
Tingkat editing: {{tingkat}}
Naskah asli:
"""
{{naskah}}
"""

Output:
1. Diagnosis masalah naskah (struktur, kejelasan, ritme, klaim).
2. Versi rewrite penuh.
3. Change log keputusan penting (mengapa diubah).
4. Klaim yang perlu sumber.
5. Alternatif judul (5) + dek.`,
      fields: [
        { field_key: "tujuan", label: "Tujuan rewrite", field_type: "select", required: true, options: ["Lebih jelas", "Lebih persuasif", "Lebih ringkas", "Lebih literer", "Lebih formal bisnis"] },
        { field_key: "audiens", label: "Audiens", field_type: "text", required: true },
        { field_key: "tingkat", label: "Tingkat editing", field_type: "radio", required: true, options: ["Light line edit", "Heavy line edit", "Structural rewrite"] },
        { field_key: "naskah", label: "Naskah", field_type: "textarea", required: true },
      ],
    },
    {
      title: "Research Synthesis Writer — From Sources to Insight",
      description: "Mensintesis banyak sumber jadi argumen koheren dengan pemetaan kesepakatan/konflik.",
      mode: "template",
      tags: ["menulis", "riset", "sintesis"],
      body: `Anda adalah research synthesis writer.

Pertanyaan riset: {{pertanyaan}}
Sumber/notes:
{{sumber}}
Audiens: {{audiens}}
Output form: {{format}}

Hasilkan:
1. Key insights (bukan ringkasan ulang sumber).
2. Agreement / disagreement map antar sumber.
3. Gaps & uncertainties.
4. Sintesis naratif sesuai format.
5. Suggested citations placeholders [SUMBER-n].
6. Next research questions.`,
      fields: [
        { field_key: "pertanyaan", label: "Pertanyaan riset", field_type: "text", required: true },
        { field_key: "sumber", label: "Sumber / notes", field_type: "textarea", required: true },
        { field_key: "audiens", label: "Audiens", field_type: "text", required: true },
        { field_key: "format", label: "Format", field_type: "radio", required: true, options: ["Brief 1 halaman", "Literature memo", "Blog analisis", "Slide narrative"] },
      ],
    },
    {
      title: "UX Microcopy System — Voice in Product UI",
      description: "Sistem microcopy untuk empty state, error, onboarding, dan permission yang konsisten.",
      mode: "template",
      tags: ["menulis", "ux-writing", "microcopy"],
      body: `Anda adalah Principal UX Writer.

Produk: {{produk}}
Persona: {{persona}}
Voice atribut: {{voice}}
Bahasa: Indonesia
Konteks layar: {{konteks}}
Komponen yang dibutuhkan: {{komponen}}
Constraint legal: {{legal}}

Hasilkan:
1. Voice principles singkat + contoh on/off-brand.
2. Pattern library copy untuk tiap komponen diminta.
3. Error message taxonomy (user fault / system fault / permission).
4. Accessibility notes (label, hint).
5. A/B variants untuk 3 string paling kritis.`,
      fields: [
        { field_key: "produk", label: "Produk", field_type: "text", required: true },
        { field_key: "persona", label: "Persona", field_type: "text", required: true },
        { field_key: "voice", label: "Voice", field_type: "checkbox", required: true, options: ["Jelas", "Tenang", "Ramah", "Ahli", "Ringkas", "Hangat"] },
        { field_key: "konteks", label: "Konteks layar", field_type: "textarea", required: true },
        { field_key: "komponen", label: "Komponen", field_type: "checkbox", required: true, options: ["Empty state", "Error", "Success toast", "Onboarding", "Permission", "Confirm delete", "Tooltip", "CTA button"] },
        { field_key: "legal", label: "Constraint legal", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Story Bible Builder — Character & World Consistency",
      description: "Membangun story bible agar karakter, dunia, dan plot tetap konsisten lintas bab.",
      mode: "static",
      tags: ["menulis", "fiksi", "story-bible"],
      body: `Anda adalah story editor untuk novel/serial.

Bangun Story Bible dari brief yang saya berikan:
1. Logline + themes.
2. Character dossiers (want/need/misbelief/arc).
3. Relationship matrix.
4. World rules & constraints.
5. Timeline & continuity tracker.
6. Plot spine (setup → midpoint → crisis → climax → resolution).
7. Subplot map.
8. Tone & POV rules.
9. Open loops list (chekhov/setup-payoff).

Tulis agar writer room bisa produksi tanpa inkonsistensi.`,
    },
    {
      title: "Proposal Writer — Persuasive RFP Response",
      description: "Menyusun proposal respons RFP yang menang: pemahaman masalah, pendekatan, bukti, pricing narrative.",
      mode: "template",
      tags: ["menulis", "proposal", "rfp", "bisnis"],
      body: `Anda adalah proposal strategist (win-rate focused).

Klien: {{klien}}
RFPsummary / kebutuhan: {{rfp}}
Kekuatan kita: {{kekuatan}}
Kelemahan/gap: {{gap}}
Kompetitor likely: {{kompetitor}}
Budget band: {{budget}}

Susun proposal:
1. Executive summary yang memenangkan (bukan ringkasan katalog).
2. Restatement masalah klien (lebih tajam dari RFP).
3. Approach & methodology (phased).
4. Team & governance.
5. Proof / case analogues (tandai [CASE] jika perlu dilengkapi).
6. Risk & mitigation.
7. Pricing narrative + assumptions.
8. Why us (diferensiasi terukur).
9. Next steps & decision checklist untuk evaluator.`,
      fields: [
        { field_key: "klien", label: "Klien", field_type: "text", required: true },
        { field_key: "rfp", label: "Ringkasan RFP", field_type: "textarea", required: true },
        { field_key: "kekuatan", label: "Kekuatan kita", field_type: "textarea", required: true },
        { field_key: "gap", label: "Gap", field_type: "textarea", required: false },
        { field_key: "kompetitor", label: "Kompetitor", field_type: "text", required: false },
        { field_key: "budget", label: "Budget band", field_type: "radio", required: false, options: ["Unknown", "<100jt", "100–500jt", ">500jt"] },
      ],
    },
    {
      title: "Newsletter Editor — Insight Density Engine",
      description: "Merancang newsletter berkepadatan insight tinggi: kurasi, framing, dan CTA lembut.",
      mode: "template",
      tags: ["menulis", "newsletter", "editorial"],
      body: `Anda adalah newsletter editor (Stratechery/Lenny-level density).

Niche: {{niche}}
Pembaca: {{pembaca}}
Frekuensi: {{frekuensi}}
Bahan minggu ini: {{bahan}}
CTA: {{cta}}

Output edisi:
1. Subject lines (5) + preview text.
2. Opening frame (mengapa ini penting sekarang).
3. 3–5 curated items dengan "so what" analysis (bukan paste link).
4. Deep-dive singkat 300–500 kata.
5. Soft CTA on-brand.
6. P.S. hook untuk reply.`,
      fields: [
        { field_key: "niche", label: "Niche", field_type: "text", required: true },
        { field_key: "pembaca", label: "Pembaca", field_type: "text", required: true },
        { field_key: "frekuensi", label: "Frekuensi", field_type: "radio", required: true, options: ["Harian", "Mingguan", "Biweekly"] },
        { field_key: "bahan", label: "Bahan minggu ini", field_type: "textarea", required: true },
        { field_key: "cta", label: "CTA", field_type: "text", required: false },
      ],
    },
    {
      title: "Documentation Writer — Human-Centered Technical Docs",
      description: "Dokumentasi teknis yang bisa diikuti pemula tanpa mengorbankan akurasi untuk ahli.",
      mode: "template",
      tags: ["menulis", "docs", "technical-writing"],
      body: `Anda adalah technical writer kelas docs-as-product.

Fitur/sistem: {{sistem}}
Audiens docs: {{audiens}}
Tugas user: {{tugas}}
Prerequisites: {{prereq}}
Environment: {{env}}

Hasilkan:
1. Information architecture halaman.
2. Quickstart (berhasil < 10 menit).
3. Conceptual overview.
4. Step-by-step procedure dengan expected results.
5. Troubleshooting tree.
6. API/reference stubs jika relevan.
7. Style consistency notes.`,
      fields: [
        { field_key: "sistem", label: "Sistem/fitur", field_type: "text", required: true },
        { field_key: "audiens", label: "Audiens", field_type: "checkbox", required: true, options: ["Developer", "Admin", "End user non-tech", "Partner"] },
        { field_key: "tugas", label: "Tugas user", field_type: "textarea", required: true },
        { field_key: "prereq", label: "Prerequisites", field_type: "textarea", required: false },
        { field_key: "env", label: "Environment", field_type: "select", required: true, options: ["Cloud SaaS", "Self-host", "Mobile", "CLI", "Hybrid"] },
      ],
    },
    {
      title: "Op-Ed Strategist — Public Argument Design",
      description: "Merancang op-ed yang berani, berdasar, dan siap editorial media.",
      mode: "static",
      tags: ["menulis", "op-ed", "opini"],
      body: `Anda adalah op-ed editor media nasional.

Bantu saya merancang op-ed kelas tinggi:
1. Claim yang spesifik & falsifiable.
2. Stakes: mengapa publik harus peduli sekarang.
3. Evidence tiers & weakest link.
4. Steelman pihak lawan.
5. Outline 700–900 kata.
6. Headline options (bukan clickbait kosong).
7. Risk ethics/legal review prompts.
8. Pitch email ke editor (120 kata).

Jika topik belum diberikan, minta hanya 5 pertanyaan paling penting lalu lanjut.`,
    },
  ],

  desain: [
    {
      title: "Product Design Critique — Heuristic + Business Lens",
      description: "Kritik desain produk dengan heuristic usability, journey friction, dan dampak bisnis.",
      mode: "template",
      tags: ["desain", "ux", "critique", "product"],
      body: `Anda adalah Principal Product Designer.

Produk: {{produk}}
Persona: {{persona}}
Tujuan user: {{tujuan}}
Surface yang dikritik: {{surface}}
Constraint: {{constraint}}
Observasi/screens desc: {{observasi}}

Audit:
1. Top friction (severity ranked).
2. Heuristic evaluation (Nielsen-ish) dengan contoh konkret.
3. Journey map gaps.
4. Redesign directions (3 konsep) + trade-offs.
5. Micro-interactions & empty/error states yang hilang.
6. Success metrics untuk validasi.
7. Prioritized backlog (P0/P1/P2).`,
      fields: [
        { field_key: "produk", label: "Produk", field_type: "text", required: true },
        { field_key: "persona", label: "Persona", field_type: "text", required: true },
        { field_key: "tujuan", label: "Tujuan user", field_type: "text", required: true },
        { field_key: "surface", label: "Surface", field_type: "select", required: true, options: ["Onboarding", "Core loop", "Checkout", "Settings", "Search", "Dashboard", "Mobile nav"] },
        { field_key: "constraint", label: "Constraint", field_type: "checkbox", required: false, options: ["Dev capacity kecil", "Brand strict", "A11y wajib", "Offline", "Legacy UI"] },
        { field_key: "observasi", label: "Deskripsi UI / temuan", field_type: "textarea", required: true },
      ],
    },
    {
      title: "Design System Architect — Tokens to Components",
      description: "Merancang fondasi design system: principles, tokens, komponen, dan governance.",
      mode: "template",
      tags: ["desain", "design-system", "tokens"],
      body: `Anda adalah Design System Architect.

Brand attributes: {{brand}}
Platforms: {{platforms}}
Kompleksitas produk: {{kompleksitas}}
Tim: {{tim}}
Pain saat ini: {{pain}}

Deliverable:
1. Design principles (5) yang decision-useful.
2. Token taxonomy (color, type, space, elevation, motion).
3. Core components priority matrix.
4. Accessibility baseline.
5. Contribution & governance model.
6. Migration plan dari UI inkonsisten.
7. Success metrics adopsi DS.`,
      fields: [
        { field_key: "brand", label: "Brand attributes", field_type: "text", required: true },
        { field_key: "platforms", label: "Platforms", field_type: "checkbox", required: true, options: ["Web", "iOS", "Android", "Marketing site", "Admin"] },
        { field_key: "kompleksitas", label: "Kompleksitas", field_type: "radio", required: true, options: ["Marketing simple", "SaaS medium", "Enterprise complex"] },
        { field_key: "tim", label: "Tim", field_type: "text", required: true },
        { field_key: "pain", label: "Pain saat ini", field_type: "textarea", required: true },
      ],
    },
    {
      title: "Visual Identity Sprint — From Strategy to Art Direction",
      description: "Art direction identitas visual: mood, typography, color rationale, application mock brief.",
      mode: "template",
      tags: ["desain", "branding", "art-direction"],
      body: `Anda adalah Creative Director.

Brand: {{brand}}
Kategori: {{kategori}}
Personality: {{personality}}
Audiens: {{audiens}}
Kompetitor look: {{kompetitor}}
Deliverable channel: {{channel}}

Hasilkan:
1. Strategic territory (3 arah visual) + rekomendasi 1.
2. Moodboard verbal (bukan hanya kata sifat kosong).
3. Color system rationale (primary/secondary/semantic).
4. Typography pairing + usage rules.
5. Imagery direction & do/don't.
6. Application briefs: {{channel}}.
7. Handoff notes untuk designer eksekusi.`,
      fields: [
        { field_key: "brand", label: "Brand", field_type: "text", required: true },
        { field_key: "kategori", label: "Kategori", field_type: "text", required: true },
        { field_key: "personality", label: "Personality", field_type: "checkbox", required: true, options: ["Berani", "Tenang", "Premium", "Ramah", "Teknis", "Playful", "Humanis"] },
        { field_key: "audiens", label: "Audiens", field_type: "text", required: true },
        { field_key: "kompetitor", label: "Look kompetitor", field_type: "textarea", required: false },
        { field_key: "channel", label: "Channel aplikasi", field_type: "checkbox", required: true, options: ["Logo suite", "Website", "Packaging", "Social templates", "Pitch deck", "App UI"] },
      ],
    },
    {
      title: "Service Blueprint Designer — Omnichannel Experience",
      description: "Service blueprint: frontstage/backstage, failures, opportunity moments.",
      mode: "template",
      tags: ["desain", "service-design", "blueprint"],
      body: `Anda adalah Service Designer.

Layanan: {{layanan}}
Persona: {{persona}}
Channel: {{channel}}
Goal journey: {{goal}}
Pain known: {{pain}}

Buat service blueprint tekstual:
1. Stages journey.
2. Frontstage actions.
3. Backstage & support processes.
4. Systems/tools.
5. Emotion curve.
6. Failure points + recovery design.
7. Opportunity ideas ranked by impact/effort.`,
      fields: [
        { field_key: "layanan", label: "Layanan", field_type: "text", required: true },
        { field_key: "persona", label: "Persona", field_type: "text", required: true },
        { field_key: "channel", label: "Channel", field_type: "checkbox", required: true, options: ["App", "Web", "WhatsApp", "Call center", "Toko offline", "Kurir/field"] },
        { field_key: "goal", label: "Goal journey", field_type: "text", required: true },
        { field_key: "pain", label: "Pain known", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Design Interview Guide — Generative Research",
      description: "Panduan wawancara generatif: script, probe, anti-bias, synthesis template.",
      mode: "template",
      tags: ["desain", "research", "interview"],
      body: `Anda adalah UX Research lead.

Topik riset: {{topik}}
Hypothesis: {{hipotesis}}
Partisipan: {{partisipan}}
Durasi: {{durasi}}
Constraint etika: {{etika}}

Hasilkan:
1. Research goals & non-goals.
2. Screening criteria.
3. Discussion guide (warm-up → critical incident → wrap).
4. Probing cheatsheet.
5. Bias risks & mitigations.
6. Note-taking template.
7. Affinity synthesis plan + opportunity solution tree starter.`,
      fields: [
        { field_key: "topik", label: "Topik riset", field_type: "text", required: true },
        { field_key: "hipotesis", label: "Hypothesis", field_type: "textarea", required: true },
        { field_key: "partisipan", label: "Partisipan", field_type: "text", required: true },
        { field_key: "durasi", label: "Durasi", field_type: "radio", required: true, options: ["30 menit", "45 menit", "60 menit"] },
        { field_key: "etika", label: "Etika/privacy", field_type: "textarea", required: false },
      ],
    },
    {
      title: "Accessibility Remediation Plan — WCAG Practical",
      description: "Rencana perbaikan a11y praktis untuk produk digital berdasarkan isu yang dilaporkan.",
      mode: "static",
      tags: ["desain", "a11y", "wcag"],
      body: `Anda adalah Accessibility specialist (WCAG 2.2 AA practical).

Saya akan memberi daftar isu UI. Buatkan remediation plan:
1. Triage severity (blocker for disabled users first).
2. Fix guidance per isu (design + engineering notes).
3. Component-level patterns (focus, contrast, forms, live regions).
4. QA checklist manual + automated.
5. Rollout & regression strategy.
6. How to write acceptance criteria a11y di ticket.

Jawab konkret, bukan ceramah teori.`,
    },
    {
      title: "Motion Design Brief — Meaningful Animation",
      description: "Brief motion yang mendukung usability: timing, easing, reduced-motion, purpose.",
      mode: "template",
      tags: ["desain", "motion", "interaction"],
      body: `Anda adalah motion lead product.

Interaksi: {{interaksi}}
Tujuan motion: {{tujuan}}
Platform: {{platform}}
Brand feel: {{feel}}
Constraint performa: {{performa}}

Brief:
1. Purpose statement (jika tidak membantu task, cut).
2. Storyboard langkah.
3. Timing/easing tokens.
4. Reduced-motion fallback.
5. Implementation notes (CSS/Lottie/rAF tradeoffs).
6. Do/don't examples.`,
      fields: [
        { field_key: "interaksi", label: "Interaksi", field_type: "text", required: true },
        { field_key: "tujuan", label: "Tujuan motion", field_type: "select", required: true, options: ["Orientasi spasial", "Feedback status", "Hierarki perhatian", "Delight ringan", "Branding moment"] },
        { field_key: "platform", label: "Platform", field_type: "checkbox", required: true, options: ["Web", "iOS", "Android"] },
        { field_key: "feel", label: "Brand feel", field_type: "radio", required: true, options: ["Crisp/minimal", "Soft/friendly", "Bold/energetic"] },
        { field_key: "performa", label: "Constraint", field_type: "radio", required: true, options: ["Low-end devices", "Normal", "Desktop-first"] },
      ],
    },
    {
      title: "Marketplace Listing Design — Trust & Conversion UI",
      description: "Merancang struktur halaman listing yang membangun kepercayaan dan konversi.",
      mode: "template",
      tags: ["desain", "marketplace", "conversion"],
      body: `Anda adalah product designer marketplace.

Kategori: {{kategori}}
Seller type: {{seller}}
Buyer anxiety: {{anxiety}}
Differentiators: {{diff}}
Device utama: {{device}}

Output:
1. Information architecture PDP/listing.
2. Trust stack (apa yang harus terlihat early).
3. Above-the-fold wireframe textual.
4. Comparison & filter UX notes.
5. Risk of dark patterns to avoid.
6. Metrics instrumentation suggestions.`,
      fields: [
        { field_key: "kategori", label: "Kategori", field_type: "text", required: true },
        { field_key: "seller", label: "Tipe seller", field_type: "radio", required: true, options: ["Individual", "UMKM", "Brand", "Mixed"] },
        { field_key: "anxiety", label: "Buyer anxiety", field_type: "textarea", required: true },
        { field_key: "diff", label: "Differentiators", field_type: "textarea", required: false },
        { field_key: "device", label: "Device utama", field_type: "radio", required: true, options: ["Mobile", "Desktop", "Both"] },
      ],
    },
    {
      title: "Workshop Facilitation Kit — Design Sprint Lite",
      description: "Paket fasilitasi workshop half-day: agenda, prompts, decision rules, outputs.",
      mode: "static",
      tags: ["desain", "workshop", "facilitation"],
      body: `Anda adalah design ops facilitator.

Buatkan Design Sprint Lite (4 jam) kit:
1. Pre-reads & participant roles.
2. Minute-by-minute agenda.
3. Exercise prompts (diverge/converge).
4. Decision protocol (how we choose without HiPPO).
5. Templates output (problem frame, sketch, test plan).
6. Anti-patterns fasilitasi.
7. Remote vs onsite variants.

Siap dipakai PM/designer tanpa coach eksternal.`,
    },
    {
      title: "Portfolio Case Study Coach — Impact Narrative",
      description: "Mengubah proyek desain menjadi case study berorientasi impact, bukan estetika semata.",
      mode: "template",
      tags: ["desain", "portfolio", "case-study"],
      body: `Anda adalah design career coach (hiring manager lens).

Proyek: {{proyek}}
Peran Anda: {{peran}}
Constraints: {{constraints}}
Hasil/metrics: {{metrics}}
Artefak: {{artefak}}

Susun case study:
1. Hook & context.
2. Your decisions (bukan hanya proses generik double diamond).
3. Trade-offs.
4. Impact (quant + qual) — tandai asumsi.
5. Reflection & what you'd do differently.
6. Visual outline (urutan frame).
7. Interview stories (STAR) turunan dari case.`,
      fields: [
        { field_key: "proyek", label: "Proyek", field_type: "textarea", required: true },
        { field_key: "peran", label: "Peran", field_type: "text", required: true },
        { field_key: "constraints", label: "Constraints", field_type: "textarea", required: true },
        { field_key: "metrics", label: "Metrics/hasil", field_type: "textarea", required: false },
        { field_key: "artefak", label: "Artefak", field_type: "checkbox", required: false, options: ["Research", "Wireframe", "UI final", "Prototype", "A/B result", "Design system"] },
      ],
    },
  ],
};

module.exports = { CATEGORIES, PART1, REST };
