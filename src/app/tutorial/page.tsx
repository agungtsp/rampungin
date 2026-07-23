import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Panduan Penggunaan — Rampungin",
  description:
    "Pelajari cara menjelajah, menyalin, dan membuat prompt AI di Rampungin, termasuk field dinamis dan pengaturan visibilitas.",
};

type Step = {
  title: string;
  body: string;
  points?: string[];
};

const browseSteps: Step[] = [
  {
    title: "Jelajahi berdasarkan kategori",
    body: "Di beranda, pilih salah satu chip kategori untuk melihat prompt sejenis, atau buka halaman kategori langsung.",
  },
  {
    title: "Cari yang spesifik",
    body: "Gunakan kolom pencarian untuk mencari berdasarkan judul, atau isi kolom Tag untuk menyaring berdasarkan tag tertentu.",
  },
  {
    title: "Lihat yang sedang tren",
    body: "Buka menu Trending untuk melihat prompt terpopuler, diurutkan dari skor (like × 2 + jumlah salin).",
  },
];

const copySteps: Step[] = [
  {
    title: "Buka detail prompt",
    body: "Klik kartu prompt mana pun untuk membuka halaman detailnya beserta preview gambar/video (jika ada).",
  },
  {
    title: "Isi parameter (untuk prompt Template)",
    body: "Prompt bertipe Template punya form dinamis. Lengkapi field yang ditandai bintang (*) karena wajib diisi.",
    points: [
      "Text / Textarea — ketik jawaban bebas",
      "Select — pilih satu opsi dari dropdown",
      "Radio button — pilih tepat satu opsi",
      "Checkbox — pilih satu atau lebih opsi",
    ],
  },
  {
    title: "Hasilkan & salin",
    body: "Klik “Hasilkan Prompt” untuk melihat hasil akhir, lalu “Salin” untuk menyalin ke clipboard. Prompt statis bisa langsung disalin.",
  },
];

const createSteps: Step[] = [
  {
    title: "Masuk dengan Google",
    body: "Klik “Masuk” lalu login dengan akun Google. Profil dan username otomatis dibuat pada login pertama.",
  },
  {
    title: "Isi info dasar & kategori",
    body: "Buka “Buat Prompt”, isi judul, deskripsi, lalu pilih kategori yang paling sesuai agar mudah ditemukan.",
  },
  {
    title: "Pilih mode prompt",
    body: "Pilih Template berparameter (punya form yang bisa diisi pengunjung) atau Prompt statis (teks siap pakai).",
  },
  {
    title: "Rancang field dinamis (mode Template)",
    body: "Tambahkan field lalu pilih tipenya. Tulis {{field_key}} di dalam template untuk menyisipkan jawaban.",
    points: [
      "Text — input satu baris",
      "Textarea — input banyak baris",
      "Select / Radio button — pilihan tunggal dari daftar opsi",
      "Checkbox — pilihan ganda (jawaban digabung dengan koma)",
      "Untuk Select/Radio/Checkbox, isi opsi dipisah koma",
    ],
  },
  {
    title: "Tambahkan media & atur visibilitas",
    body: "Unggah gambar preview (jpg/png/webp, maks 2MB) dan/atau URL video. Terakhir atur visibilitas prompt.",
    points: [
      "Publik — bisa dilihat & disalin siapa saja",
      "Privat — hanya kamu yang bisa mengakses",
      "Publik untuk X jam — otomatis jadi privat setelah waktunya habis",
    ],
  },
];

const socialSteps: Step[] = [
  {
    title: "Like & komentar",
    body: "Setelah login, kamu bisa menyukai prompt publik. Komentar memakai Disqus di halaman detail prompt.",
  },
  {
    title: "Follow kreator",
    body: "Buka profil kreator dan tekan Follow untuk mengikuti karya-karya mereka.",
  },
  {
    title: "Kelola akun",
    body: "Di halaman Akun saya (/me) kamu bisa mengubah username & profil, mengatur ulang visibilitas prompt, atau menghapus akun secara permanen.",
  },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="flex gap-4 rounded-2xl border border-blue-900/10 bg-white p-4 shadow-card"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-700 text-sm font-semibold text-white">
            {i + 1}
          </span>
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-950">{s.title}</h3>
            <p className="text-sm text-blue-900/75">{s.body}</p>
            {s.points && (
              <ul className="ml-1 space-y-1 text-sm text-blue-900/70">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Section({
  emoji,
  title,
  subtitle,
  children,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-blue-950">
          <span>{emoji}</span>
          {title}
        </h2>
        <p className="text-blue-900/70">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default function TutorialPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-10">
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-blue-900 via-blue-800 to-sky-600 px-6 py-12 text-white shadow-card sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative space-y-4">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Panduan Penggunaan
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Cara pakai Rampungin dalam beberapa menit
          </h1>
          <p className="max-w-xl text-blue-50/90">
            Rampungin adalah tempat gratis untuk menemukan, mengisi, dan
            membagikan prompt AI. Ikuti panduan singkat di bawah ini.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/"
              className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-blue-950 transition hover:bg-amber-200"
            >
              Mulai jelajahi
            </Link>
            <Link
              href="/prompts/new"
              className="rounded-full border border-white/40 px-5 py-2.5 text-sm transition hover:bg-white/10"
            >
              Buat prompt
            </Link>
          </div>
        </div>
      </section>

      <Section
        emoji="🔎"
        title="1. Menemukan prompt"
        subtitle="Jelajah dan temukan prompt yang kamu butuhkan."
      >
        <StepList steps={browseSteps} />
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-900/12 bg-white px-3 py-1.5 text-sm text-blue-900 shadow-sm transition hover:border-blue-400 hover:bg-blue-50"
            >
              <span>{c.emoji}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </Section>

      <Section
        emoji="📋"
        title="2. Menyalin prompt"
        subtitle="Isi parameter (jika ada) lalu salin hasilnya."
      >
        <StepList steps={copySteps} />
      </Section>

      <Section
        emoji="✨"
        title="3. Membuat prompt sendiri"
        subtitle="Buat template berparameter atau prompt siap pakai."
      >
        <StepList steps={createSteps} />
      </Section>

      <Section
        emoji="💬"
        title="4. Berinteraksi & mengelola akun"
        subtitle="Dukung kreator lain dan atur prompt milikmu."
      >
        <StepList steps={socialSteps} />
      </Section>

      <section className="rounded-2xl border border-blue-900/10 bg-blue-50/60 p-6 text-center">
        <h2 className="text-xl font-bold text-blue-950">Siap mencoba?</h2>
        <p className="mt-1 text-blue-900/70">
          Semua fitur gratis selamanya — share tanpa batas.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/prompts/new"
            className="rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
          >
            Buat prompt gratis
          </Link>
          <Link
            href="/trending"
            className="rounded-full border border-blue-700 px-5 py-2.5 text-sm font-medium text-blue-800 transition hover:bg-blue-50"
          >
            Lihat trending
          </Link>
        </div>
      </section>
    </main>
  );
}
