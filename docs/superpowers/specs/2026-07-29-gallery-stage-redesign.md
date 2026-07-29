# Rampungin Visual Redesign — Gallery Stage

**Date:** 2026-07-29  
**Status:** Approved for planning  
**Product:** Rampungin — free community hub for sharing AI prompts online

## Design read

Redesign overhaul of an AI prompt-sharing platform for creators and browsers, with a **hybrid Gallery Stage** language: studio-clean chrome + lively discovery, indigo–cyan accent system, Phosphor category icons, high-contrast text.

**Dials:** `DESIGN_VARIANCE: 7` · `MOTION_INTENSITY: 6` · `VISUAL_DENSITY: 4`

## Goals

- Feel professional enough to trust as a prompt platform
- Feel cool and interactive on discovery surfaces without clutter
- Stay simple to use (clear primary actions, no decorative UI that blocks tasks)
- Keep existing product behavior and data (search, featured, categories, auth, create/edit)

## Non-goals

- New product features (payments, AI generation backends, new entity types)
- Full rebrand / new logo silhouette
- Dashboard-density admin UI redesign beyond shared tokens
- Replacing Disqus or backend auth flows

## Decisions locked

| Decision | Choice |
|---|---|
| Personality | **C — Hybrid** (clean chrome + marketplace energy on discovery) |
| Accent | **C — Soft indigo–cyan** (cyan CTAs, indigo pins/badges) |
| Logo | **C — Light refresh** (same silhouette, cleaner geometry, new gradient) |
| Home approach | **B — Gallery Stage** (dark stage hero + featured bento + clean grid) |
| Category affordance | Phosphor icons (replace emoji) on chips, cards, category pages |
| Text contrast | Stronger ink hierarchy; stop remapping Tailwind `slate-*` to blue |

---

## 1. Visual system

### 1.1 Color tokens

| Token | Light | Role |
|---|---|---|
| `primary` / CTA | `#06B6D4` (hover `#0891B2`) | Solid buttons, focus rings, interactive accent |
| `accent-quiet` | `#4F46E5` | Pins, badges, secondary chips only |
| `canvas` | `#F8FAFC` | Page background |
| `panel` | `#FFFFFF` | Cards, header, forms |
| `stage` | `#0F172A` | Home hero panel only |
| `ink` | `#0F172A` | Titles, nav labels, card titles |
| `ink-muted` | `#334155` | Body, descriptions, subtitles |
| `ink-faint` | `#475569` | Meta only (counts, timestamps) — never long paragraphs |
| `soft` | tint of cyan/indigo at low opacity | Chip hover, soft fills |
| `secondary` (border) | cool grey border (`#E2E8F0` range) | Dividers, card edges |

**Dark mode:** canvas `#0B1220`, panel `#111827`, ink `#F1F5F9`, muted `#CBD5E1`, faint `#94A3B8`, primary lifts to `#22D3EE`, quiet accent `#818CF8`.

**Rules:**

- One accent system only — no orange/amber leftover accents unless semantic (errors)
- White/light text only on solid cyan, indigo, or stage backgrounds
- Body copy targets WCAG AA (≥ 4.5:1)
- Do **not** remap Tailwind `slate-*` / `blue-*` utility scales to brand blues; use semantic tokens (`ink`, `primary`, `soft`, etc.)

### 1.2 Typography

| Role | Font | Notes |
|---|---|---|
| Display | Sora (existing) | Headlines, section titles |
| Sans / UI | DM Sans (existing) | Body, nav, forms |
| Mono | Geist Mono or JetBrains Mono (add) | Prompt body previews / detail |

Display tracking tight; body `leading-relaxed`, max ~65ch for long descriptions.

### 1.3 Logo refresh

- Keep R + brace + spark silhouette
- Cleaner corner radius / stroke consistency
- Gradient: indigo → cyan (replace current blue → sky)
- Spark: subtle highlight (not loud yellow clutter)
- Update mark SVG, PWA/theme-color meta to cyan primary

### 1.4 Icons

- Library: `@phosphor-icons/react` only (one family)
- Default weight: regular; stroke ~1.75
- Replace category emoji in chips, PromptCard, category headers

| Slug | Icon |
|---|---|
| (all) | `SquaresFour` |
| `marketing` | `Megaphone` |
| `coding` | `Code` |
| `menulis` | `PencilSimple` |
| `desain` | `Palette` |
| `bisnis` | `ChartLineUp` |
| `edukasi` | `GraduationCap` |
| `produktivitas` | `Lightning` |
| `data` | `ChartBar` |
| `hiburan` | `FilmStrip` |
| `lainnya` | `PuzzlePiece` |

---

## 2. Home & navigation (Gallery Stage)

### 2.1 Header

- Sticky, frosted/translucent panel (`backdrop-filter`), thin cool border
- Logo + wordmark, central smart search, compact nav links
- **Share** = only solid cyan button in chrome
- Theme + language + user menu unchanged in placement; restyle to tokens

### 2.2 Stage hero

- Shown on `/` when **not** searching (`!q`)
- Full-bleed-within-content dark stage card: radial indigo/cyan glow on `#0F172A`
- Content: badge (count), headline, one subtitle, CTA group (Share primary, Trending secondary)
- Hidden in search mode for a simpler results path

### 2.3 Category rail

- Sticky under header (keep behavior)
- Pill chips with Phosphor icon + label (+ optional count)
- Active: solid ink or cyan; inactive: outline + muted icon/text
- Horizontal scroll on small screens

### 2.4 Featured bento

- Keep existing featured data source
- Layout: first card wider (~1.35fr), remaining equal in a 3-column band on desktop; stack on mobile
- Section title + “See all” → trending

### 2.5 Latest / search grid

- Keep `marketplace-grid` density
- Search mode: skip stage + featured; show smart results bar + grid only

---

## 3. Cards, detail & other surfaces

### 3.1 Prompt card

- Cover-forward, rounded 16px, light border, soft shadow
- Category icon badge on cover; indigo “Pinned” / admin chip when relevant
- Title in `ink`; meta in `ink-faint` (rating, copies, author)
- Hover: translateY(-4px) + cyan-tinted shadow; cover scale ~1.03
- No glassmorphism stacks or floating sticker clutter

### 3.2 Prompt detail

- Clear hierarchy: title → meta (icon category, platform, author) → action strip → mono prompt body
- Actions: **Copy** (cyan primary), Open in AI / Save (secondary), Pin (indigo quiet)
- Template placeholders highlighted with cyan/indigo tints inside mono block
- Comments / related keep layout; restyle to tokens

### 3.3 Forms, auth, profiles

- Studio-clean: panel surfaces, existing `field-control` pattern with new border/focus (cyan ring)
- Primary submit = cyan
- Auth: centered panel on canvas, refreshed logo, Google CTA
- Profile / saved / my-prompts / trending / editor-picks: same card + header system; no custom competing palettes

### 3.4 Motion

- Page enter: short fade-up on hero + first grid
- Cards: hover only (no infinite loops)
- Copy success: brief check pulse (~150–200ms)
- Stage: optional slow CSS gradient drift
- All motion respects `prefers-reduced-motion`
- Forms/dashboards: no decorative motion

---

## 4. Technical approach

### Stack (existing + adds)

- Next.js App Router, React 19, Tailwind v4 (keep)
- Add: `@phosphor-icons/react`
- Add: mono font via `next/font`
- Motion: prefer CSS + small client leaves; add `motion` only if hover/orchestration needs it

### Touch points (implementation scope)

1. `globals.css` — retokenize; remove slate/blue hijacks; stage/background utilities; contrast tokens
2. `layout.tsx` — fonts, theme-color
3. `public/brand/rampungin-mark.svg` (+ any generated icons that bake old blue)
4. `SiteHeader`, `SiteFooter`, `CategoryChips`, `PromptCard`, home `page.tsx` hero/featured
5. Prompt detail / editor / auth / profile shared chrome classes
6. `lib/categories.ts` — icon key map (emoji may remain as fallback data but UI uses icons)
7. Cover gradients — optionally retune to indigo/cyan family for cohesion

### Constraints

- Preserve i18n, locale routes, Supabase auth, RLS, smart search, pagination
- Do not change API contracts
- Prefer semantic token classes over one-off hex in components
- Audit dark mode after token swap (existing `html.dark` overrides may need cleanup)

### Verification

- Visual pass: home, search, category, detail, create, auth, dark mode
- Contrast spot-check on titles/body/meta
- `npm test` + `npm run lint` + `npm run build`
- Reduced-motion: no stuck/animating backgrounds

---

## 5. Success criteria

- First visit reads as a prompt **platform**, not a generic blue SaaS template
- Share / Copy are obvious; browsing stays fun (stage + bento + card hover)
- Category icons are recognizable without emoji
- Body text remains clearly readable in light and dark
- No new product flows required to use the redesign

---

## 6. Out of scope follow-ups

- Marketing landing separate from the app home
- Custom illustration system beyond covers
- Native mobile apps
