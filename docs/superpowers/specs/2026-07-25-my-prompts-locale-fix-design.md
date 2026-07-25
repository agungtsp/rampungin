# Design: Locale ID list fix + My Prompts page

**Date:** 2026-07-25  
**Status:** Approved (user: approach 1, nav A, /me A, create CTA on page)

## Problem

1. Homepage/category (and other list pages) show no prompts when locale is Indonesian, while English works.
2. Logged-in users need a dedicated “My prompts” surface with homepage-style cards and edit actions.

## Root cause (locale)

`filterByLocale` for `id` requires filled `title` **and** `body`. List selects (`LIST_SELECT*`) include `body_en` via i18n columns but omit `body`, so client-side filtering drops every Indonesian row. English works because `body_en` is selected.

## Solution

### Locale fix

- Add `body` (and `tags` for parity) to all `LIST_SELECT*` / `LIST_SELECT_BASE*` strings in `src/lib/prompt-select.ts`.
- Keep existing `applyLocaleAvailabilityFilter` + `filterByLocale` behavior.

### My prompts

- New auth-required route: `/my-prompts` (middleware + redirect like `/saved`).
- Header: when logged in, primary CTA **Buat prompt** → **Prompt saya** linking to `/my-prompts`; guests keep **Buat prompt** → `/prompts/new`.
- Page: title, **Buat baru** → `/prompts/new`, marketplace card grid of **all** prompts owned by the current user (no public-only filter; show private too).
- Cards reuse `PromptCard` with optional edit control → `promptEditPath`.
- Localize card title/cover via `localizePrompt` for current locale (fallback as today).
- `/me`: remove prompts list + visibility controls; keep profile edit + account delete. Visibility remains on prompt edit form.

## Out of scope

- Changing bilingual content rules (title+body required per locale).
- Moving visibility controls onto the card grid.
