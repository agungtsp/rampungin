# Deploy Rampungin (gratis) — Vercel + Supabase

Checklist biar production jalan, termasuk **login Google**.

> Stack: **Next.js 16** + React 19 + Tailwind 4 + Supabase. Pastikan Vercel memakai Node 20+.

## 0) Prasyarat

- [ ] Repo di GitHub/GitLab (folder app: `rampungin/`)
- [ ] Project Supabase sudah ada (migration + seed sudah dijalankan)
- [ ] Google OAuth sudah diaktifkan di Supabase (Auth → Providers → Google)

---

## 1) Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → **Add New… → Project**
2. Import repo
3. **Root Directory** = `rampungin` (penting: monorepo)
4. Framework: Next.js (otomatis)
5. Jangan deploy dulu — isi env dulu (langkah 2)
6. **Deploy**

Setelah selesai, catat URL-nya, contoh:

`https://rampungin.vercel.app`

---

## 2) Environment variables (Vercel)

Project → **Settings → Environment Variables** → isi untuk **Production** (dan Preview jika perlu):

| Name | Contoh / sumber | Wajib? |
|------|-----------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Ya |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → `anon` `public` | Ya |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → `service_role` (rahasia) | Hanya jika script/server memakainya |
| `NEXT_PUBLIC_SITE_URL` | `https://rampungin.vercel.app` (tanpa slash akhir) | Ya (share/Disqus/absolute URL) |
| `NEXT_PUBLIC_DISQUS_SHORTNAME` | shortname Disqus (bukan `*.disqus.com`) | Opsional |

### Database migration (i18n)

Jalankan di Supabase SQL Editor:

`supabase/migrations/20260725120000_prompt_i18n.sql`

Menambah kolom `title_en`, `description_en`, `body_en`, `tags_en`.

---
| `NEXT_PUBLIC_CREATOR_USERNAME` | `agungtsp` | Opsional |
| `NEXT_PUBLIC_DONATE_*` | link donasi | Opsional |

Lalu **Redeploy** agar env terbaca.

> Jangan commit file `.env` ke git.

---

## 3) Supabase Auth URLs (wajib biar Google login jalan)

Supabase Dashboard → **Authentication → URL Configuration**:

### Site URL

```text
https://rampungin.vercel.app
```

(ganti dengan URL Vercel / domain custom-mu)

### Redirect URLs (allow list)

Tambahkan minimal:

```text
https://rampungin.vercel.app/auth/callback
https://rampungin.vercel.app/**
```

Kalau pakai Preview deployments Vercel:

```text
https://*-username.vercel.app/auth/callback
https://*-username.vercel.app/**
```

(pola sesuai akun Vercel-mu; atau tambahkan URL preview spesifik)

Alur app: Google → kembali ke  
`{origin}/auth/callback?next=...`  
lalu `exchangeCodeForSession` di `src/app/auth/callback/route.ts`.

---

## 4) Google Cloud OAuth (kalau belum / masih localhost saja)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**
2. OAuth 2.0 Client (Web)
3. **Authorized JavaScript origins** — tambahkan:
   - `https://rampungin.vercel.app`
   - (opsional) `http://localhost:3000` untuk lokal
4. **Authorized redirect URIs** — harus callback **Supabase**, biasanya:

```text
https://<PROJECT-REF>.supabase.co/auth/v1/callback
```

   (lihat di Supabase → Auth → Providers → Google; jangan pakai URL Vercel di sini)

5. Client ID + Secret yang sama dipakai di Supabase Google provider

---

## 5) Storage (gambar prompt)

Kalau upload preview image:

- [ ] Bucket storage sudah ada + policy RLS sesuai migration
- [ ] URL public image tetap dari project Supabase yang sama (tidak perlu env ekstra selain Supabase URL/key)

---

## 6) Smoke test production

Setelah deploy + env + redirect:

- [ ] Buka homepage → list prompt muncul
- [ ] Buka `/auth` → **Lanjutkan dengan Google** → kembali login (ada session)
- [ ] `/prompts/new` bisa diakses saat login
- [ ] Like / Bagikan jalan
- [ ] Favicon logo Rampungin muncul (hard refresh kalau cache)
- [ ] `/about` & donasi (kalau env donate diisi)

---

## 7) Domain custom (opsional, tetap bisa gratis di Vercel)

1. Vercel → Project → **Domains** → tambah `rampungin.com`
2. Ikuti DNS (A/CNAME) dari Vercel
3. Update:
   - `NEXT_PUBLIC_SITE_URL=https://rampungin.com`
   - Supabase Site URL + Redirect URLs
   - Google JS origins (tambah domain baru)
4. Redeploy

---

## Troubleshooting login Google

| Gejala | Cek |
|--------|-----|
| Redirect ke localhost | `NEXT_PUBLIC_SITE_URL` / Site URL Supabase masih localhost |
| `redirect_uri_mismatch` | Redirect URI di Google harus `…supabase.co/auth/v1/callback` |
| Kembali ke site tapi belum login | Redirect URL Vercel `/auth/callback` belum di allow list Supabase |
| Error env / blank data | Env Vercel kosong → redeploy setelah isi |
| Root Directory salah | Build gagal / 404 → set root ke `rampungin` |

---

## Batasan gratis (ingat)

- **Vercel Hobby** & **Supabase Free**: cukup untuk soft launch; ada limit bandwidth/DB/idle pause.
- Jangan expose `service_role` ke browser (hanya server/env Vercel).
