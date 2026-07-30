import type { Locale } from "@/lib/i18n/locale";

export type LabsAudience =
  | "daily"
  | "family"
  | "friends"
  | "business"
  | "school";

export type LabsStory = {
  id: string;
  audience: LabsAudience;
  label: string;
  title: string;
  persona: string;
  problem: string;
  result: string;
  metricLabel: string;
  metricBefore: string;
  metricAfter: string;
  metricPct: number;
  accent: string;
};

export type LabsIntakeCopy = {
  formTitle: string;
  formSub: string;
  name: string;
  email: string;
  phone: string;
  phoneHint: string;
  audience: string;
  problem: string;
  problemHint: string;
  repeating: string;
  repeatingHint: string;
  timeSpent: string;
  expectations: string;
  notes: string;
  notesHint: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successBody: string;
  errorGeneric: string;
  audiences: Record<string, string>;
  times: Record<string, string>;
  expectationOptions: Record<string, string>;
};

const STORY_BARS: Record<LabsAudience, number[]> = {
  daily: [88, 62, 45, 28, 18],
  family: [30, 48, 55, 70, 82],
  friends: [20, 35, 40, 68, 85],
  business: [40, 52, 61, 78, 92],
  school: [25, 40, 58, 74, 90],
};

export function storyBars(audience: LabsAudience): number[] {
  return STORY_BARS[audience];
}

export function labsStories(locale: Locale): LabsStory[] {
  if (locale === "en") {
    return [
      {
        id: "daily",
        audience: "daily",
        label: "Daily work",
        title: "Your 6pm inbox finally chill",
        persona: "Remote pro · updates, notes & follow-ups",
        problem:
          "Evenings vanished rewriting status updates, meeting notes, and “just checking in” emails from scratch.",
        result:
          "A tiny prompt pack now drafts the weekly report and polite follow-ups before dinner hits the table.",
        metricLabel: "Hours saved / week",
        metricBefore: "6h",
        metricAfter: "1h",
        metricPct: 83,
        accent: "from-cyan-500 to-teal-400",
      },
      {
        id: "family",
        audience: "family",
        label: "Family",
        title: "Sunday planning without the chaos",
        persona: "Parent of two · school & household",
        problem:
          "Meal plans, teacher messages, and weekend activities turned every Sunday into a stress marathon.",
        result:
          "Shared prompts spit out meal plans, warm teacher replies, and kid-friendly activity ideas — together.",
        metricLabel: "Sunday stress",
        metricBefore: "High",
        metricAfter: "Low",
        metricPct: 70,
        accent: "from-amber-400 to-orange-500",
      },
      {
        id: "friends",
        audience: "friends",
        label: "Friends",
        title: "Hangouts that actually happen",
        persona: "Friend group · trips & random plans",
        problem:
          "Group chats stalled on itineraries, gift ideas, and endless “so… what should we do?” loops.",
        result:
          "One shared workflow turns chat noise into a clear itinerary, budget, and RSVP message.",
        metricLabel: "Plans that stick",
        metricBefore: "2/10",
        metricAfter: "8/10",
        metricPct: 80,
        accent: "from-fuchsia-500 to-pink-500",
      },
      {
        id: "business",
        audience: "business",
        label: "Business",
        title: "Ops that don’t wait on one “AI person”",
        persona: "SME ops lead · 18-person team",
        problem:
          "Support macros, SOPs, and sales follow-ups depended on one hero — slow, inconsistent, exhausting.",
        result:
          "Labs built reusable prompt playbooks so everyone ships the same crisp AI output.",
        metricLabel: "First-response quality",
        metricBefore: "62%",
        metricAfter: "91%",
        metricPct: 91,
        accent: "from-violet-500 to-indigo-500",
      },
      {
        id: "school",
        audience: "school",
        label: "Schools & learning",
        title: "Study & teaching that feel lighter",
        persona: "Teacher + students · lesson prep & learning",
        problem:
          "Lesson outlines, quiz drafts, and study summaries ate nights — and students still felt stuck alone.",
        result:
          "Prompt kits help teachers prep faster and students revise smarter, without losing the human touch.",
        metricLabel: "Prep time per lesson",
        metricBefore: "3h",
        metricAfter: "45m",
        metricPct: 75,
        accent: "from-emerald-500 to-lime-400",
      },
    ];
  }

  return [
    {
      id: "daily",
      audience: "daily",
      label: "Kerja harian",
      title: "Inbox jam 6 sore akhirnya santai",
      persona: "Pekerja remote · update, notulensi & follow-up",
      problem:
        "Malam hilang karena menulis ulang status, notulensi, dan email “sekadar menanyakan” dari nol.",
      result:
        "Paket prompt kecil sekarang menyusun laporan mingguan dan follow-up sopan sebelum makan malam.",
      metricLabel: "Jam hemat / minggu",
      metricBefore: "6j",
      metricAfter: "1j",
      metricPct: 83,
      accent: "from-cyan-500 to-teal-400",
    },
    {
      id: "family",
      audience: "family",
      label: "Keluarga",
      title: "Planning Minggu tanpa drama",
      persona: "Orang tua dua anak · sekolah & rumah",
      problem:
        "Menu, pesan ke guru, dan aktivitas weekend mengubah setiap Minggu jadi marathon stres.",
      result:
        "Prompt bersama menghasilkan meal plan, balasan guru yang hangat, dan ide aktivitas ramah anak.",
      metricLabel: "Stres Minggu",
      metricBefore: "Tinggi",
      metricAfter: "Rendah",
      metricPct: 70,
      accent: "from-amber-400 to-orange-500",
    },
    {
      id: "friends",
      audience: "friends",
      label: "Teman",
      title: "Hangout yang benar-benar jadi",
      persona: "Grup teman · trip & rencana spontan",
      problem:
        "Chat grup macet di itinerary, ide hadiah, dan loop “jadi mau ngapain?” tanpa ujung.",
      result:
        "Satu alur bersama mengubah noise chat jadi itinerary jelas, budget, dan pesan RSVP.",
      metricLabel: "Rencana yang nyangkut",
      metricBefore: "2/10",
      metricAfter: "8/10",
      metricPct: 80,
      accent: "from-fuchsia-500 to-pink-500",
    },
    {
      id: "business",
      audience: "business",
      label: "Bisnis",
      title: "Ops yang tak nunggu “orang AI”",
      persona: "Ops lead UMKM · 18 orang",
      problem:
        "Makro support, SOP, dan follow-up sales bergantung pada satu hero — lambat, beda-beda, capek.",
      result:
        "Labs bikin playbook prompt yang bisa dipakai semua orang dengan kualitas yang sama.",
      metricLabel: "Kualitas respons awal",
      metricBefore: "62%",
      metricAfter: "91%",
      metricPct: 91,
      accent: "from-violet-500 to-indigo-500",
    },
    {
      id: "school",
      audience: "school",
      label: "Sekolah & belajar",
      title: "Belajar & mengajar yang lebih ringan",
      persona: "Guru + siswa · persiapan & belajar",
      problem:
        "Outline materi, draft kuis, dan rangkuman belajar menghabiskan malam — siswa tetap merasa sendirian.",
      result:
        "Kit prompt bantu guru siapkan materi lebih cepat dan siswa belajar lebih cerdas, tanpa hilang sentuhan manusia.",
      metricLabel: "Waktu siap per materi",
      metricBefore: "3j",
      metricAfter: "45m",
      metricPct: 75,
      accent: "from-emerald-500 to-lime-400",
    },
  ];
}

export function labsIntakeCopy(locale: Locale): LabsIntakeCopy {
  if (locale === "en") {
    return {
      formTitle: "Talk to our experts",
      formSub:
        "Spill the messy problem — about 3 minutes. We’ll follow up on WhatsApp or email.",
      name: "Your name (or nickname)",
      email: "Email",
      phone: "WhatsApp number",
      phoneHint: "Include country code, e.g. +62…",
      audience: "Who is this for?",
      problem: "What’s the main problem you’re stuck on right now?",
      problemHint: "Tell it like you’d tell a friend — messy is fine.",
      repeating: "Which tasks keep repeating every week?",
      repeatingHint: "E.g. reports, follow-ups, lesson prep, group planning…",
      timeSpent: "How much time does that usually eat per week?",
      expectations: "What do you hope happens after talking to our experts?",
      notes: "Anything else we should know? (optional)",
      notesHint: "Tools you use, language, deadlines, vibes — whatever helps.",
      submit: "Send to the experts",
      submitting: "Sending…",
      successTitle: "Got it — thanks for sharing!",
      successBody:
        "Our prompt experts will read this and follow up. Keep an eye on WhatsApp and email.",
      errorGeneric: "Something went wrong. Please try again in a moment.",
      audiences: {
        daily: "Just me (daily work)",
        family: "Family / household",
        friends: "Friends / community",
        business: "Business / team",
        school: "School / learning",
        mix: "A mix",
      },
      times: {
        under_2h: "Under 2 hours",
        "2_5h": "2–5 hours",
        "5_10h": "5–10 hours",
        "10_plus": "10+ hours",
      },
      expectationOptions: {
        playbook: "Clear prompt / playbook I can reuse",
        drafting: "Faster drafting with ChatGPT or Gemini",
        shared_workflow: "A workflow my team / family / class can share",
        prioritize: "Help prioritizing what to automate first",
        exploring: "Just curious — explore ideas",
      },
    };
  }

  return {
    formTitle: "Ngobrol dengan expert kami",
    formSub:
      "Ceritakan masalahnya — ±3 menit. Kami follow-up lewat WhatsApp atau email.",
    name: "Nama (atau nama panggilan)",
    email: "Email",
    phone: "Nomor WhatsApp",
    phoneHint: "Pakai kode negara, mis. +62…",
    audience: "Ini untuk siapa?",
    problem: "Apa masalah utama yang lagi bikin stuck sekarang?",
    problemHint: "Ceritakan seperti ke teman — berantakan juga boleh.",
    repeating: "Tugas mana yang terus berulang tiap minggu?",
    repeatingHint: "Mis. laporan, follow-up, siap materi, planning grup…",
    timeSpent: "Biasanya itu makan waktu berapa per minggu?",
    expectations: "Apa yang kamu harapkan setelah ngobrol dengan expert kami?",
    notes: "Ada yang lain yang perlu kami tahu? (opsional)",
    notesHint: "Tools, bahasa, deadline, vibe — apa saja yang membantu.",
    submit: "Kirim ke expert",
    submitting: "Mengirim…",
    successTitle: "Berhasil — terima kasih sudah cerita!",
    successBody:
      "Expert prompt kami akan baca ini dan follow-up. Cek WhatsApp dan email ya.",
    errorGeneric: "Ada yang gagal. Coba lagi sebentar lagi.",
    audiences: {
      daily: "Diri sendiri (kerja harian)",
      family: "Keluarga / rumah tangga",
      friends: "Teman / komunitas",
      business: "Bisnis / tim",
      school: "Sekolah / belajar",
      mix: "Campuran",
    },
    times: {
      under_2h: "Di bawah 2 jam",
      "2_5h": "2–5 jam",
      "5_10h": "5–10 jam",
      "10_plus": "10+ jam",
    },
    expectationOptions: {
      playbook: "Prompt / playbook jelas yang bisa dipakai ulang",
      drafting: "Drafting lebih cepat di ChatGPT atau Gemini",
      shared_workflow: "Alur yang bisa dibagi ke tim / keluarga / kelas",
      prioritize: "Bantuan prioritas: otomatisasi apa dulu",
      exploring: "Sekadar penasaran — eksplor ide",
    },
  };
}

export function labsSeoCopy(locale: Locale) {
  if (locale === "en") {
    return {
      metaTitle: "Talk to AI Prompt Experts · Fun Automation Labs",
      metaDescription:
        "Stuck on repeating tasks? Talk to Rampungin Labs experts — fun, practical AI automation for daily work, family, friends, business, schools & learning.",
      eyebrow: "Rampungin Labs · talk to prompt experts",
      title: "Got a repeating headache? Let’s make it fun to fix.",
      subtitle:
        "Spill the messy problem — daily work, family chaos, friend plans, business ops, or school learning. Our prompt experts help you turn it into an AI workflow you’ll actually enjoy using.",
      cta: "Talk to our experts",
      ctaHint: "On-site form · ~3 minutes · WhatsApp follow-up",
      storiesTitle: "Wins that feel good to copy",
      storiesSub:
        "Sample stories from daily work, family, friends, business, and schools & learning — the kind of glow-up Labs loves to build.",
      pillarsTitle: "Why people hang out with Labs",
      pillars: [
        {
          title: "Expert ears, human vibe",
          body: "You talk. We listen. Then we craft prompts that sound like you — not like a robot wrote a robot.",
          tone: "from-cyan-500 to-teal-400",
        },
        {
          title: "Life + learning + work",
          body: "From inbox calm to classroom prep and team playbooks — one Lab, many kinds of joy.",
          tone: "from-emerald-500 to-lime-400",
        },
        {
          title: "Ship something today",
          body: "Leave with wording you can paste into ChatGPT or Gemini tonight — then reuse all week.",
          tone: "from-violet-500 to-fuchsia-500",
        },
      ],
      whoTitle: "Come as you are",
      who: [
        "Pros tired of rewriting the same email",
        "Families who want calmer Sundays",
        "Friends who want plans that stick",
        "Teams ready for practical AI (not slide decks)",
        "Teachers & learners who want lighter prep & smarter study",
      ],
      howTitle: "How the fun part works",
      how: [
        {
          step: "01",
          title: "Tell us the sticky problem",
          body: "What’s annoying, what repeats, what “done” looks like — casual language welcome.",
        },
        {
          step: "02",
          title: "Experts shape the prompts",
          body: "We design clear prompt playbooks for ChatGPT, Gemini, or both — tuned to your world.",
        },
        {
          step: "03",
          title: "You try it and smile",
          body: "Use it today, tweak it tomorrow, share it with family, friends, class, or team.",
        },
      ],
      closeTitle: "Ready to chat with the experts?",
      closeBody:
        "No perfect brief needed. Bring one messy repeating task — we’ll help turn it into something digital, AI-powered, and honestly enjoyable.",
      before: "Before",
      after: "After",
    };
  }

  return {
    metaTitle: "Ngobrol dengan Expert Prompt AI · Labs yang Asyik",
    metaDescription:
      "Stuck dengan tugas berulang? Ngobrol dengan expert Rampungin Labs — otomatisasi AI yang fun & praktis untuk kerja harian, keluarga, teman, bisnis, sekolah & belajar.",
    eyebrow: "Rampungin Labs · ngobrol dengan expert prompt",
    title: "Punya ribet yang berulang? Yuk bikin proses beresnya jadi asyik.",
    subtitle:
      "Ceritakan masalahnya — kerja harian, chaos keluarga, rencana bareng teman, ops bisnis, atau belajar di sekolah. Expert prompt kami bantu ubah jadi alur AI yang enak dipakai.",
    cta: "Ngobrol dengan expert kami",
    ctaHint: "Form di situs · ±3 menit · follow-up WhatsApp",
    storiesTitle: "Kemenangan yang enak ditiru",
    storiesSub:
      "Contoh cerita dari kerja harian, keluarga, teman, bisnis, serta sekolah & belajar — glow-up yang Labs suka bangunin.",
    pillarsTitle: "Kenapa orang betah di Labs",
    pillars: [
      {
        title: "Telinga expert, vibe manusia",
        body: "Kamu cerita. Kami dengar. Lalu kami susun prompt yang terdengar seperti kamu — bukan robot yang menulis robot.",
        tone: "from-cyan-500 to-teal-400",
      },
      {
        title: "Hidup + belajar + kerja",
        body: "Dari inbox yang adem sampai siap materi kelas dan playbook tim — satu Lab, banyak jenis senang.",
        tone: "from-emerald-500 to-lime-400",
      },
      {
        title: "Langsung bisa dipakai hari ini",
        body: "Pulang dengan wording yang bisa ditempel ke ChatGPT atau Gemini malam ini — lalu dipakai sepekan.",
        tone: "from-violet-500 to-fuchsia-500",
      },
    ],
    whoTitle: "Datang apa adanya",
    who: [
      "Profesional yang capek nulis ulang email yang sama",
      "Keluarga yang ingin Minggu lebih tenang",
      "Teman yang ingin rencana benar-benar jadi",
      "Tim yang siap AI praktis (bukan slide deck)",
      "Guru & pelajar yang ingin siap materi lebih ringan & belajar lebih cerdas",
    ],
    howTitle: "Bagian bagian asyiknya",
    how: [
      {
        step: "01",
        title: "Ceritakan masalah yang nempel",
        body: "Apa yang mengganggu, apa yang berulang, seperti apa “selesai” — bahasa santai boleh banget.",
      },
      {
        step: "02",
        title: "Expert merancang promptnya",
        body: "Kami susun playbook prompt jelas untuk ChatGPT, Gemini, atau keduanya — sesuai duniamu.",
      },
      {
        step: "03",
        title: "Kamu coba dan tersenyum",
        body: "Pakai hari ini, sesuaikan besok, bagikan ke keluarga, teman, kelas, atau tim.",
      },
    ],
    closeTitle: "Siap ngobrol dengan expert?",
    closeBody:
      "Tak perlu brief sempurna. Bawa satu tugas berulang yang berantakan — kami bantu jadi digital, bertenaga AI, dan honestly enak dipakai.",
    before: "Sebelum",
    after: "Sesudah",
  };
}
