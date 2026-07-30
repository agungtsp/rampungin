# Rampungin Labs — Native Intake Form + Telegram

**Date:** 2026-07-30  
**Status:** Approved for planning  
**Product:** Rampungin Labs (`/labs`)

## Goal

Replace the Google Form intake with an on-site Labs form that:

1. Collects the lead (including WhatsApp phone)
2. Stores the submission in Supabase
3. Notifies the team via Telegram
4. Lets admins review leads on a simple site page

## Decisions locked

| Decision | Choice |
|---|---|
| Approach | Native form → `POST /api/labs/submit` → DB + Telegram |
| Who can submit | Anyone (public); if logged in, also store `user_id` |
| Review (v1) | Telegram alert + Supabase + admin list page |
| Phone | Required WhatsApp number (with country code hint) |
| Google Form | Removed (`NEXT_PUBLIC_LABS_FORM_URL` dropped) |
| Telegram | Existing bot via `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` |

## Non-goals (v1)

- Lead status workflow (new / contacted / closed)
- Email auto-replies
- Public “my submissions” history
- Captcha (defer; use light IP rate limiting only)
- Editing submissions after submit

---

## 1. Form UX (`/labs`)

Replace external CTA + “what we’ll ask” preview with a real interactive form in the same playful Labs tone.

**Fields**

| Field | Type | Required |
|---|---|---|
| Name (or nickname) | text | yes |
| Email | email | yes |
| WhatsApp number | tel / text | yes |
| Who is this for? | single select | yes |
| Main problem | textarea | yes |
| Repeating weekly tasks | textarea | yes |
| Time spent / week | single select | yes |
| What do you hope after talking to experts? | multi checkbox | yes (≥1) |
| Anything else? | textarea | no |

**Audience options:** daily work · family · friends · business · school/learning · mix  

**Time options:** under 2h · 2–5h · 5–10h · 10+h  

**Expectation options:** reusable playbook · faster drafting · shared workflow · prioritize automation · just exploring  

**Phone UX**

- Label: WhatsApp number / Nomor WhatsApp  
- Hint: include country code, e.g. `+62…`  
- Normalize for storage: strip spaces/dashes; keep leading `+` if present  
- Telegram + admin UI show a `https://wa.me/<digits>` link (digits only, no `+`)

**Submit states**

- Idle → submitting (disable button) → success thank-you (hide form or show confirmation card)  
- Error: show friendly message; keep field values  

**CTAs elsewhere on `/labs`:** scroll to `#labs-form` (or focus the form) instead of opening Google Form.

**i18n:** EN + ID labels/hints/options (same structure as current `labsFormQuestions`).

---

## 2. Data model

New table `public.labs_submissions`:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `created_at` | timestamptz | default `now()` |
| `user_id` | uuid nullable | FK → `profiles(id)` ON DELETE SET NULL |
| `locale` | text | `en` \| `id` |
| `name` | text | |
| `email` | text | |
| `phone` | text | normalized WhatsApp number |
| `audience` | text | enum-like check |
| `problem` | text | |
| `repeating_tasks` | text | |
| `time_spent` | text | |
| `expectations` | text[] | |
| `notes` | text nullable | |
| `ip_hash` | text nullable | hashed IP for rate-limit / abuse (no raw IP) |
| `telegram_sent_at` | timestamptz nullable | |
| `telegram_error` | text nullable | last send failure message |

**RLS**

- Enable RLS  
- No policies for `anon` / `authenticated` insert or select  
- Writes/reads only via service role (API + admin server pages)  
- Optional: admin client reads only through server components that check `is_admin` then use service role

---

## 3. API — `POST /api/labs/submit`

**Auth:** none required. If session exists, attach `user_id`.

**Flow**

1. Parse JSON body; validate required fields + email shape + phone min length  
2. Optional: reject if same `ip_hash` submitted > N times in last hour (e.g. 5)  
3. Insert row with service role  
4. Send Telegram message via Bot API (`sendMessage`)  
5. Update row `telegram_sent_at` or `telegram_error`  
6. Return `{ ok: true }` even if Telegram failed (submission is the source of truth)

**Telegram message** (plain text or HTML):

- New Labs lead header  
- Name, email, WhatsApp link  
- Audience, time spent  
- Problem + repeating tasks (truncated if very long)  
- Expectations joined  
- Notes if any  
- Link to `/admin/labs` (using `NEXT_PUBLIC_SITE_URL`)  
- If `user_id` present: note “logged-in user” + profile username when cheap to resolve

**Env (server only)**

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

If either missing: still insert; set `telegram_error` to a clear “not configured” message.

Remove `NEXT_PUBLIC_LABS_FORM_URL` from `.env.local.example` and `src/lib/labs.ts` (or repurpose `labs.ts` for helpers only).

---

## 4. Admin UI — `/admin/labs`

- Gate: logged-in + `profiles.is_admin` (reuse `isAdmin` / `roles.ts` pattern); otherwise 404 or redirect home  
- List newest first: created_at, name, email, WhatsApp link, audience, problem snippet  
- Expandable or detail row for full problem / repeating / expectations / notes  
- No mutations in v1 (read-only)

---

## 5. Components / files (expected)

| Piece | Role |
|---|---|
| `LabsIntakeForm` (client) | Form UI + submit fetch |
| `labs-content.ts` | Field labels/options + SEO copy updates (no Google Form copy) |
| `POST /api/labs/submit` | Validate, insert, Telegram |
| `lib/telegram.ts` | Small `sendTelegramMessage` helper |
| Migration `labs_submissions` | Schema + RLS |
| `app/admin/labs/page.tsx` | Admin list |
| Docs | Replace `labs-google-form-questions.md` with intake/env setup notes |

---

## 6. Error handling & testing

- Validation errors → 400 with field-friendly message  
- DB insert failure → 500; no Telegram  
- Telegram failure → log + persist `telegram_error`; still 200  
- Vitest: phone normalize / wa.me builder; optional API validation unit tests  
- Manual: submit logged-out + logged-in; confirm row + Telegram; open `/admin/labs` as admin

---

## Success criteria

- `/labs` has a working bilingual form with WhatsApp field  
- Submissions appear in `labs_submissions`  
- Telegram chat receives a readable alert (when env set)  
- Admins can list leads at `/admin/labs`  
- Google Form dependency is gone
