# Design: Guide UX, soft delete, short links

Date: 2026-07-27  
Status: Implemented (Approach 1)

## Goals

1. Clean How-to-use panel: no static ChatGPT/AI Studio links; no Example result in defaults/seed.
2. After Generate Prompt, show Open ChatGPT / Open AI Studio; remove q/prompt helper text.
3. Saved prompts: icon-only remove-from-folder / unsave-all with aria-label/title.
4. My prompts: soft delete via icon + confirm; no restore UI.
5. Owner short links at `/p/{slug}` (auto + optional custom); resolve only while public.
6. Document all of the above in the tutorial guide.

## Data

- `prompts.deleted_at timestamptz`
- `prompts.short_slug text` unique when not null; format `^[a-z0-9]([a-z0-9-]{1,46}[a-z0-9])?$`
- RLS select requires `deleted_at is null`

## Routes / APIs

- `GET /p/[slug]` → redirect to localized profile prompt URL or 404
- `POST /api/prompts/[id]/soft-delete` (owner)
- `POST|DELETE /api/prompts/[id]/short-link` (owner; public-only create)

## Middleware

Bare `/p/{slug}` skips forced locale prefix redirect.
