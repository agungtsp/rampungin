import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Panduan Penggunaan — Rampungin",
  description:
    "Pelajari cara menemukan, menyalin, dan membuat prompt AI di Rampungin — termasuk field dinamis dan pengaturan visibilitas.",
};

type Step = {
  title: string;
  body: string;
  points?: string[];
};

const browseSteps: Step[] = [
  {
    title: "Jelajahi berdasarkan kategori",
    body: "Di beranda, pilih chip kategori untuk melihat prompt sejenis, atau buka halaman kategori secara langsung.",
  },
  {
    title: "Cari yang spesifik",
    body: "Gunakan pencarian untuk menemukan prompt berdasarkan konteks, judul, atau tag tertentu.",
  },
  {
    title: "Lihat yang sedang tren",
    body: "Buka menu Trending untuk melihat prompt terpopuler, diurutkan dari skor komunitas (suka, salin, dan generate).",
  },
];

const copySteps: Step[] = [
  {
    title: "Buka detail prompt",
    body: "Klik kartu prompt untuk membuka halaman detail beserta pratinjau gambar atau video (jika tersedia).",
  },
  {
    title: "Isi parameter (untuk prompt Template)",
    body: "Prompt bertipe Template memiliki form dinamis. Lengkapi field bertanda bintang (*) karena wajib diisi.",
    points: [
      "Text / Textarea — ketik jawaban bebas",
      "Select — pilih satu opsi dari daftar",
      "Radio button — pilih tepat satu opsi",
      "Checkbox — pilih satu atau lebih opsi",
    ],
  },
  {
    title: "Hasilkan & salin",
    body: "Klik “Hasilkan prompt” untuk melihat hasil akhir, lalu “Salin” untuk menyalin ke clipboard. Prompt statis dapat langsung disalin.",
  },
];

const createSteps: Step[] = [
  {
    title: "Masuk dengan Google",
    body: "Klik “Masuk”, lalu masuk dengan akun Google. Profil dan username dibuat otomatis pada login pertama.",
  },
  {
    title: "Isi info dasar & kategori",
    body: "Buka “Buat prompt”, isi judul dan deskripsi, lalu pilih kategori yang paling sesuai agar mudah ditemukan.",
  },
  {
    title: "Pilih mode prompt",
    body: "Pilih Template berparameter (pengunjung mengisi form) atau Prompt statis (teks siap pakai).",
  },
  {
    title: "Rancang field dinamis (mode Template)",
    body: "Tambahkan field lalu pilih tipenya. Tulis {{field_key}} di dalam template untuk menyisipkan jawaban pengguna.",
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
    body: "Unggah gambar pratinjau (jpg/png/webp, maks. 2MB) dan/atau URL video. Terakhir, atur visibilitas prompt.",
    points: [
      "Publik — dapat dilihat dan disalin siapa saja",
      "Privat — hanya kamu yang dapat mengakses",
      "Publik untuk X jam — otomatis menjadi privat setelah waktu habis",
    ],
  },
];

const socialSteps: Step[] = [
  {
    title: "Suka & komentar",
    body: "Setelah masuk, kamu dapat menyukai prompt publik. Komentar menggunakan Disqus di halaman detail prompt.",
  },
  {
    title: "Ikuti kreator",
    body: "Buka profil kreator dan tekan Ikuti untuk mengikuti karya mereka.",
  },
  {
    title: "Kelola akun",
    body: "Di halaman Akun saya (/me) kamu dapat mengubah username & profil, mengatur ulang visibilitas prompt, atau menghapus akun secara permanen.",
  },
];

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((s, i) => (
        <li
          key={s.title}
          className="flex gap-4 rounded-2xl border border-primary/10 bg-white p-4 shadow-card"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-hover text-sm font-semibold text-white">
            {i + 1}
          </span>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">{s.title}</h3>
            <p className="text-sm text-ink-muted">{s.body}</p>
            {s.points && (
              <ul className="ml-1 space-y-1 text-sm text-ink-muted">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="text-primary">•</span>
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
        <h2 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <span>{emoji}</span>
          {title}
        </h2>
        <p className="text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default function TutorialPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-12 px-4 py-10">
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-hover via-primary to-secondary px-6 py-12 text-white shadow-card sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative space-y-4">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Panduan Penggunaan
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Pelajari Rampungin dalam beberapa menit
          </h1>
          <p className="max-w-xl text-white/90">
            Temukan, isi, dan bagikan prompt AI secara gratis. Ikuti panduan
            singkat di bawah ini.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/"
              className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-amber-200"
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
        subtitle="Jelajahi katalog dan temukan prompt yang kamu butuhkan."
      >
        <StepList steps={browseSteps} />
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/12 bg-white px-3 py-1.5 text-sm text-ink shadow-sm transition hover:border-secondary hover:bg-soft"
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
        subtitle="Isi parameter (jika ada), lalu salin hasilnya."
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
        subtitle="Dukung kreator lain dan kelola prompt milikmu."
      >
        <StepList steps={socialSteps} />
      </Section>

      <section className="rounded-2xl border border-primary/10 bg-soft/60 p-6 text-center">
        <h2 className="text-xl font-bold text-ink">Siap mencoba?</h2>
        <p className="mt-1 text-ink-muted">
          Semua fitur gratis selamanya — bagikan tanpa batas.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/prompts/new"
            className="rounded-full bg-primary-hover px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
          >
            Buat prompt gratis
          </Link>
          <Link
            href="/trending"
            className="rounded-full border border-primary-hover px-5 py-2.5 text-sm font-medium text-primary-hover transition hover:bg-soft"
          >
            Lihat trending
          </Link>
        </div>
      </section>
    </main>
  );
}
