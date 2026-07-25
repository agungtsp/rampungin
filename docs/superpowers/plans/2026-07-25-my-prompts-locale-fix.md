# My Prompts + Locale ID Fix Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Fix Indonesian empty catalog lists and add `/my-prompts` with card grid + edit, replacing the logged-in Create CTA.

**Architecture:** Fix list selects so `filterByLocale` receives `body` for ID. Add auth page mirroring `/saved` patterns; thin header change; strip prompts from `/me`.

**Tech Stack:** Next.js App Router, Supabase, existing `PromptCard` / i18n helpers.

## Global Constraints

- Match existing Rampungin UI patterns (marketplace-grid, LocaleLink, messages).
- Do not filter owner’s own prompts by locale availability.
- Auth gate `/my-prompts` in middleware.

---

### Task 1: Fix list selects for ID locale

**Files:** `src/lib/prompt-select.ts`

- [ ] Add `body, tags` to `LIST_SELECT`, `LIST_SELECT_WITH_GEN`, `LIST_SELECT_BASE`, `LIST_SELECT_BASE_GEN`.
- [ ] Smoke: ID homepage shows prompts when EN does.

### Task 2: PromptCard optional edit

**Files:** `src/components/PromptCard.tsx`

- [ ] Add optional `editHref?: string | null`.
- [ ] When set, show Edit button (does not steal card link click).

### Task 3: `/my-prompts` page

**Files:** `src/app/my-prompts/page.tsx`, `src/middleware.ts`, `src/lib/i18n/messages.ts` (empty-state keys if needed)

- [ ] Auth redirect; query `prompts` where `author_id = user.id`.
- [ ] Card grid + Buat baru; use LIST_SELECT-style fields + localizePrompt.
- [ ] `pathNeedsAuth` include `/my-prompts`.

### Task 4: Header + clean `/me`

**Files:** `src/components/SiteHeader.tsx`, `src/app/me/page.tsx`, `src/app/me/MeDashboard.tsx`

- [ ] Logged-in CTA → `/my-prompts` with `t("myPrompts")`.
- [ ] Remove prompts props/section/visibility helpers from me flow.
