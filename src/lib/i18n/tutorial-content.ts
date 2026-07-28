import type { Locale } from "./locale";

export type TutorialStep = {
  title: string;
  body: string;
  points?: string[];
};

type TutorialCopy = {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  heroTitle: string;
  heroBody: string;
  startBrowse: string;
  createPrompt: string;
  sections: {
    browse: { title: string; subtitle: string; steps: TutorialStep[] };
    copy: { title: string; subtitle: string; steps: TutorialStep[] };
    create: { title: string; subtitle: string; steps: TutorialStep[] };
    social: { title: string; subtitle: string; steps: TutorialStep[] };
  };
  ctaTitle: string;
  ctaBody: string;
  ctaCreate: string;
  ctaTrending: string;
};

const id: TutorialCopy = {
  metaTitle: "Panduan Penggunaan — Rampungin",
  metaDescription:
    "Pelajari cara menemukan, menyalin, dan membuat prompt AI di Rampungin — termasuk field dinamis dan pengaturan visibilitas.",
  badge: "Panduan Penggunaan",
  heroTitle: "Pelajari Rampungin dalam beberapa menit",
  heroBody:
    "Temukan, isi, dan bagikan prompt AI secara gratis. Ikuti panduan singkat di bawah ini.",
  startBrowse: "Mulai jelajahi",
  createPrompt: "Buat prompt",
  sections: {
    browse: {
      title: "1. Menemukan prompt",
      subtitle: "Jelajahi katalog dan temukan prompt yang kamu butuhkan.",
      steps: [
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
      ],
    },
    copy: {
      title: "2. Menyalin prompt",
      subtitle: "Isi parameter (jika ada), lalu salin hasilnya.",
      steps: [
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
          title: "Generate Prompt & salin",
          body: "Klik “Generate Prompt” untuk melihat hasil akhir, lalu “Salin” untuk menyalin ke clipboard. Berlaku untuk prompt dengan form maupun tanpa form.",
        },
        {
          title: "Buka di ChatGPT / AI Studio",
          body: "Setelah Generate, tombol Open ChatGPT ↗ dan Open AI Studio ↗ muncul di bawah hasil. Klik untuk membuka tab baru dengan teks prompt yang sudah terisi.",
        },
      ],
    },
    create: {
      title: "3. Membuat prompt sendiri",
      subtitle: "Buat template berparameter atau prompt siap pakai.",
      steps: [
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
          body: "Unggah gambar pratinjau per bahasa (jpg/png/webp, maks. 2MB) dan/atau URL video. Terakhir, atur visibilitas prompt.",
          points: [
            "Publik — dapat dilihat dan disalin siapa saja",
            "Privat — hanya kamu yang dapat mengakses",
            "Publik untuk X jam — otomatis menjadi privat setelah waktu habis",
          ],
        },
        {
          title: "Short link (pemilik)",
          body: "Di halaman detail prompt milikmu, buat short link /p/slug. Bisa digenerate otomatis atau pakai slug custom. Short link hanya aktif saat prompt publik.",
        },
      ],
    },
    social: {
      title: "4. Berinteraksi & mengelola akun",
      subtitle: "Dukung kreator lain dan kelola prompt milikmu.",
      steps: [
        {
          title: "Suka, rating & komentar",
          body: "Setelah masuk, kamu dapat menyukai prompt publik dan memberi rating bintang 1–5 di halaman detail. Komentar memakai Disqus.",
        },
        {
          title: "Simpan prompt ke folder",
          body: "Klik ikon bookmark pada kartu atau tombol Simpan di detail, lalu pilih folder (atau Tanpa kategori). Kelola di menu Tersimpan.",
          points: [
            "Buat, ubah nama, atau hapus folder",
            "Gunakan ikon hapus dari folder / hapus semua (lihat label aksesibilitas tombol)",
            "Folder Tanpa kategori dibuat otomatis dan tidak bisa dihapus",
          ],
        },
        {
          title: "Prompt saya & hapus",
          body: "Di Prompt saya kamu dapat pin, edit, atau menghapus (soft delete) prompt milikmu lewat ikon hapus. Prompt terhapus disembunyikan dan short link berhenti berfungsi.",
        },
        {
          title: "Ikuti kreator",
          body: "Buka profil kreator dan tekan Ikuti untuk mengikuti karya mereka.",
        },
        {
          title: "Kelola akun & syarat",
          body: "Di Akun saya (/me) kamu dapat mengubah profil. Saat membuat/mengedit prompt, wajib mencentang Syarat & Ketentuan (tanggung jawab konten ada pada kreator).",
        },
      ],
    },
  },
  ctaTitle: "Siap mencoba?",
  ctaBody: "Semua fitur gratis selamanya — bagikan tanpa batas.",
  ctaCreate: "Buat prompt gratis",
  ctaTrending: "Lihat trending",
};

const en: TutorialCopy = {
  metaTitle: "User Guide — Rampungin",
  metaDescription:
    "Learn how to find, copy, and create AI prompts on Rampungin — including dynamic fields and visibility settings.",
  badge: "User Guide",
  heroTitle: "Learn Rampungin in a few minutes",
  heroBody:
    "Discover, fill in, and share AI prompts for free. Follow the short guide below.",
  startBrowse: "Start browsing",
  createPrompt: "Create prompt",
  sections: {
    browse: {
      title: "1. Finding prompts",
      subtitle: "Browse the catalog and find the prompts you need.",
      steps: [
        {
          title: "Browse by category",
          body: "On the home page, pick a category chip to see related prompts, or open a category page directly.",
        },
        {
          title: "Search specifically",
          body: "Use search to find prompts by context, title, or tags.",
        },
        {
          title: "See what’s trending",
          body: "Open Trending to view the most popular prompts, ranked by community score (likes, copies, and generates).",
        },
      ],
    },
    copy: {
      title: "2. Copying a prompt",
      subtitle: "Fill in parameters (if any), then copy the result.",
      steps: [
        {
          title: "Open prompt details",
          body: "Click a prompt card to open the detail page with image or video preview (when available).",
        },
        {
          title: "Fill parameters (Template prompts)",
          body: "Template prompts have a dynamic form. Complete fields marked with an asterisk (*) — they are required.",
          points: [
            "Text / Textarea — free-form answers",
            "Select — choose one option from a list",
            "Radio button — choose exactly one option",
            "Checkbox — choose one or more options",
          ],
        },
        {
          title: "Generate Prompt & copy",
          body: "Click “Generate Prompt” to see the final result, then “Copy” to copy it to the clipboard. Applies to prompts with or without a form.",
        },
        {
          title: "Open in ChatGPT / AI Studio",
          body: "After Generate, the Open ChatGPT ↗ and Open AI Studio ↗ buttons appear under the result. Click to open a new tab with the prompt text prefilled.",
        },
      ],
    },
    create: {
      title: "3. Creating your own prompt",
      subtitle: "Build a parameterized template or a ready-to-use prompt.",
      steps: [
        {
          title: "Sign in with Google",
          body: "Click “Sign in”, then continue with Google. Your profile and username are created automatically on first login.",
        },
        {
          title: "Fill basics & category",
          body: "Open “Create prompt”, add a title and description, then pick the best-fit category so others can find it.",
        },
        {
          title: "Choose prompt mode",
          body: "Pick a parameterized Template (visitors fill a form) or a static Prompt (ready-to-use text).",
        },
        {
          title: "Design dynamic fields (Template mode)",
          body: "Add fields and choose their types. Write {{field_key}} in the template to insert the user’s answers.",
          points: [
            "Text — single-line input",
            "Textarea — multi-line input",
            "Select / Radio button — single choice from options",
            "Checkbox — multiple choices (joined with commas)",
            "For Select/Radio/Checkbox, enter options separated by commas",
          ],
        },
        {
          title: "Add media & set visibility",
          body: "Upload a preview image per language (jpg/png/webp, max 2MB) and/or a video URL. Then set prompt visibility.",
          points: [
            "Public — anyone can view and copy",
            "Private — only you can access",
            "Public for X hours — automatically becomes private when time is up",
          ],
        },
        {
          title: "Short link (owner)",
          body: "On your prompt detail page, create a short link at /p/slug. Auto-generate or set a custom slug. The short link only works while the prompt is public.",
        },
      ],
    },
    social: {
      title: "4. Engaging & managing your account",
      subtitle: "Support other creators and manage your own prompts.",
      steps: [
        {
          title: "Likes, ratings & comments",
          body: "After signing in, you can like public prompts and leave a 1–5 star rating on the detail page. Comments use Disqus.",
        },
        {
          title: "Save prompts to folders",
          body: "Click the bookmark on a card or Save on the detail page, then pick a folder (or Uncategorized). Manage everything under Saved.",
          points: [
            "Create, rename, or delete folders",
            "Use the remove-from-folder / unsave-all icons (see each button’s accessibility label)",
            "Uncategorized is created automatically and cannot be deleted",
          ],
        },
        {
          title: "My prompts & delete",
          body: "On My prompts you can pin, edit, or soft-delete your prompts via the delete icon. Deleted prompts are hidden and their short links stop working.",
        },
        {
          title: "Follow creators",
          body: "Open a creator’s profile and press Follow to follow their work.",
        },
        {
          title: "Account & terms",
          body: "On My account (/me) you can update your profile. When creating/editing a prompt, you must accept the Terms (creators are responsible for their content).",
        },
      ],
    },
  },
  ctaTitle: "Ready to try?",
  ctaBody: "Every feature is free forever — share without limits.",
  ctaCreate: "Create a free prompt",
  ctaTrending: "See trending",
};

export function getTutorialCopy(locale: Locale): TutorialCopy {
  return locale === "en" ? en : id;
}
