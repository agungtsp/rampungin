# Rampungin (rampungin.com)

Free community hub for sharing AI prompt context.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Supabase (Google Auth, Postgres + RLS, Storage)

## Setup

1. Create a Supabase project.
2. Run SQL in `supabase/migrations/20260722120000_init.sql` (SQL editor).
3. Enable **Google** provider in Authentication → Providers.
4. Add redirect URL: `http://localhost:3000/auth/callback` (and production URL).
5. Copy `.env.local.example` → `.env.local` and fill keys.

```bash
cd rampungin.com
npm install
npm run dev
```

## Scripts

- `npm run dev` — local server
- `npm test` — unit tests (visibility, interpolate, trending)
- `npm run build` — production build

## Features

- Google login / register
- Create template or static prompts
- Public / private / public for X hours
- Image upload + video URL preview
- Gallery, profile, trending
- Like, comment, follow
- Delete account
- Free messaging on home
