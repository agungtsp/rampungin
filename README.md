# Rampungin

Free community hub for sharing AI prompt context.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Supabase (Google Auth, Postgres + RLS, Storage)

## Setup

1. Create a Supabase project.
2. Run SQL migrations in `supabase/migrations/` (SQL editor, in order).
3. Enable **Google** provider in Authentication → Providers.
4. Add redirect URL: `http://localhost:3000/auth/callback` (and production URL).
5. Copy `.env.local.example` → `.env.local` and fill keys.

```bash
cd rampungin
npm install
npm run dev
```

## Scripts

- `npm run dev` — local server
- `npm test` — unit tests
- `npm run build` — production build
- `npm run lint` — ESLint

## Features

- Google login / register
- Create template or static prompts
- Public / private / public for X hours
- Image upload + video URL preview
- Gallery, profile, trending, smart search
- Like, comment, follow
- Delete account

See `DEPLOY.md` for Vercel + Supabase production checklist.
