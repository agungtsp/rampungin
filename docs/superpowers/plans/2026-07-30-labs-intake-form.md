# Labs Native Intake Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Google Form with on-site Labs intake that stores in Supabase, notifies Telegram, and lists leads for admins.

**Architecture:** Client form posts to `POST /api/labs/submit` (service-role insert + Telegram Bot API). Admin page `/admin/labs` reads via service role after `is_admin` check.

**Tech Stack:** Next.js App Router, Supabase, Telegram Bot API, Vitest

**Spec:** `docs/superpowers/specs/2026-07-30-labs-intake-form-design.md`

## Global Constraints

- Phone (WhatsApp) required; public submit; attach `user_id` when logged in
- Telegram failure must not fail the user response after successful insert
- Remove `NEXT_PUBLIC_LABS_FORM_URL`
- Bilingual EN/ID

---

### Task 1: Migration + phone helpers

- [x] Create `supabase/migrations/20260730120000_labs_submissions.sql`
- [x] Create `src/lib/labs-phone.ts` (normalize + wa.me)
- [x] Create `tests/labs-phone.test.ts`
- [x] Create `src/lib/telegram.ts`

### Task 2: Submit API

- [x] Create `src/app/api/labs/submit/route.ts`
- [x] Update `src/lib/labs.ts` (drop Google Form URL; keep helpers if useful)

### Task 3: Form UI + Labs page

- [x] Create `src/components/LabsIntakeForm.tsx`
- [x] Update `src/lib/labs-content.ts` (form field defs, SEO copy)
- [x] Update `src/app/labs/page.tsx`
- [x] Remove or stop using `LabsFormPreview` for Google Form preview

### Task 4: Admin list

- [x] Create `src/app/admin/labs/page.tsx`

### Task 5: Env + docs

- [x] Update `.env.local.example`
- [x] Replace `docs/labs-google-form-questions.md` with setup notes
- [x] Run `npx tsc --noEmit` and `npm test`
