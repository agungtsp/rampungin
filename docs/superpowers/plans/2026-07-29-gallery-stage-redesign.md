# Gallery Stage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Rampungin UI to the approved Gallery Stage look — indigo–cyan tokens, readable ink, Phosphor category icons, stage home hero, featured bento, and restyled chrome/cards/detail — without changing product behavior or APIs.

**Architecture:** Retokenize Tailwind v4 semantic colors in `globals.css` (remove slate/blue hijacks). Add `@phosphor-icons/react` + a small `CategoryIcon` client component driven by icon keys on `CATEGORIES`. Restyle header/home/cards/detail to use tokens; keep data fetching, i18n, and routes unchanged.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, `@phosphor-icons/react`, `next/font` (Sora, DM Sans, JetBrains Mono), existing Supabase/i18n.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-29-gallery-stage-redesign.md`
- Do not change API routes, Supabase schema, auth flows, or smart-search ranking
- Prefer semantic tokens (`bg-primary`, `text-ink`, `bg-soft`, `border-secondary`) over one-off hex in JSX
- One icon family only: `@phosphor-icons/react` (no Lucide, no new emoji UI)
- Preserve light/dark theme via existing `html.dark` + ThemeProvider
- All decorative motion must respect `prefers-reduced-motion`
- Work inside `rampungin/`; run commands from that directory
- Frequent small commits; do not commit `.env*` or `.superpowers/`

## File map

| File | Responsibility |
|---|---|
| `src/app/globals.css` | Color tokens, shadows, stage/bg utilities, card-hover, remove slate/blue remaps |
| `src/app/layout.tsx` | Mono font variable, theme-color `#06b6d4` |
| `public/brand/rampungin-mark.svg` | Indigo→cyan logo mark |
| `src/components/RampunginLogo.tsx` | Inline SVG match mark |
| `src/lib/categories.ts` | `icon` key per category + `categoryIconName()` |
| `src/components/CategoryIcon.tsx` | Map icon key → Phosphor component |
| `src/components/CategoryChips.tsx` | Icon pills |
| `src/components/SiteHeader.tsx` | Frosted chrome, cyan Share |
| `src/components/SiteFooter.tsx` | Token restyle |
| `src/components/PromptCard.tsx` | Cover badges with icons, indigo pins, hover |
| `src/app/page.tsx` | Stage hero + featured bento layout |
| Prompt detail pages | Action strip + mono body tokens |
| `tests/categories.test.ts` | Icon key coverage tests |

---

### Task 1: Category icon keys + Phosphor dependency

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/lib/categories.ts`
- Modify: `tests/categories.test.ts`
- Create: `src/components/CategoryIcon.tsx`

**Interfaces:**
- Produces: `Category.icon: CategoryIconName`; `categoryIconName(slug): CategoryIconName`; `CategoryIcon({ name, className, size? })`
- Consumes: `@phosphor-icons/react` icons listed in the spec

- [ ] **Step 1: Write the failing tests**

Append to `tests/categories.test.ts`:

```ts
import {
  CATEGORIES,
  categoryIconName,
  categoryLabel,
  isValidCategory,
} from "@/lib/categories";

// ...existing tests...

it("exposes a stable icon key for every category and fallbacks", () => {
  const allowed = new Set([
    "megaphone",
    "code",
    "pencil-simple",
    "palette",
    "chart-line-up",
    "graduation-cap",
    "lightning",
    "chart-bar",
    "film-strip",
    "puzzle-piece",
  ]);
  for (const c of CATEGORIES) {
    expect(allowed.has(c.icon)).toBe(true);
    expect(categoryIconName(c.slug)).toBe(c.icon);
  }
  expect(categoryIconName(null)).toBe("puzzle-piece");
  expect(categoryIconName("bogus")).toBe("puzzle-piece");
  expect(categoryIconName("all")).toBe("squares-four");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd rampungin && npm test -- tests/categories.test.ts`

Expected: FAIL (missing `icon` / `categoryIconName`)

- [ ] **Step 3: Install Phosphor**

Run: `cd rampungin && npm install @phosphor-icons/react`

Expected: dependency added to `package.json`

- [ ] **Step 4: Extend `categories.ts`**

Add to `src/lib/categories.ts`:

```ts
export type CategoryIconName =
  | "squares-four"
  | "megaphone"
  | "code"
  | "pencil-simple"
  | "palette"
  | "chart-line-up"
  | "graduation-cap"
  | "lightning"
  | "chart-bar"
  | "film-strip"
  | "puzzle-piece";

export type Category = {
  slug: string;
  label: string;
  labelEn: string;
  emoji: string; // keep for backwards compat; UI must not render emoji
  icon: CategoryIconName;
  cover: string;
};

// On each CATEGORIES entry set icon:
// marketing: megaphone, coding: code, menulis: pencil-simple, desain: palette,
// bisnis: chart-line-up, edukasi: graduation-cap, produktivitas: lightning,
// data: chart-bar, hiburan: film-strip, lainnya: puzzle-piece

export function categoryIconName(
  slug: string | null | undefined,
): CategoryIconName {
  if (slug === "all" || slug === "") return "squares-four";
  if (!slug) return "puzzle-piece";
  return BY_SLUG.get(slug)?.icon ?? "puzzle-piece";
}
```

Keep existing `emoji` fields and `categoryEmoji()` for now (unused by new UI).

- [ ] **Step 5: Create `CategoryIcon.tsx`**

```tsx
"use client";

import {
  ChartBar,
  ChartLineUp,
  Code,
  FilmStrip,
  GraduationCap,
  Lightning,
  Megaphone,
  Palette,
  PencilSimple,
  PuzzlePiece,
  SquaresFour,
  type Icon,
} from "@phosphor-icons/react";
import type { CategoryIconName } from "@/lib/categories";

const MAP: Record<CategoryIconName, Icon> = {
  "squares-four": SquaresFour,
  megaphone: Megaphone,
  code: Code,
  "pencil-simple": PencilSimple,
  palette: Palette,
  "chart-line-up": ChartLineUp,
  "graduation-cap": GraduationCap,
  lightning: Lightning,
  "chart-bar": ChartBar,
  "film-strip": FilmStrip,
  "puzzle-piece": PuzzlePiece,
};

export function CategoryIcon({
  name,
  className,
  size = 16,
}: {
  name: CategoryIconName;
  className?: string;
  size?: number;
}) {
  const Cmp = MAP[name] ?? PuzzlePiece;
  return (
    <Cmp
      className={className}
      size={size}
      weight="regular"
      aria-hidden
    />
  );
}
```

If Phosphor export names differ (e.g. `FilmSlate` vs `FilmStrip`), adjust MAP to the closest available icon and update the test `allowed` set + `CategoryIconName` to match — keep one icon per category.

- [ ] **Step 6: Run tests to verify they pass**

Run: `cd rampungin && npm test -- tests/categories.test.ts`

Expected: PASS

- [ ] **Step 7: Commit**

```bash
cd /Users/agungputra/Project/TIX-ACCOMMODATION-SUPPLY-PRICING-TEST
git add rampungin/package.json rampungin/package-lock.json \
  rampungin/src/lib/categories.ts rampungin/src/components/CategoryIcon.tsx \
  rampungin/tests/categories.test.ts
git commit -m "$(cat <<'EOF'
feat(rampungin): add Phosphor category icon map

EOF
)"
```

---

### Task 2: Design tokens + readable ink (globals.css)

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS variables `--color-primary`, `--color-primary-hover`, `--color-accent-quiet`, `--color-stage`, `--color-ink*`, `--color-canvas`, `--color-panel`, `--color-soft`, `--color-secondary`; utilities usable as Tailwind colors `primary`, `accent-quiet`, `stage`, etc.
- Consumes: none

- [ ] **Step 1: Replace `@theme` brand block**

In `src/app/globals.css`, replace the existing Rampungin palette comment + `@theme { ... }` color section with:

```css
/*
  Gallery Stage palette
  Primary cyan #06B6D4 | Hover #0891B2 | Quiet indigo #4F46E5
  Canvas #F8FAFC | Ink #0F172A | Muted #334155 | Faint #475569
*/
@theme {
  --color-primary: #06b6d4;
  --color-primary-hover: #0891b2;
  --color-accent-quiet: #4f46e5;
  --color-secondary: #e2e8f0;
  --color-soft: #ecfeff;
  --color-ink: #0f172a;
  --color-ink-muted: #334155;
  --color-ink-faint: #475569;
  --color-canvas: #f8fafc;
  --color-panel: #ffffff;
  --color-stage: #0f172a;

  --font-sans: var(--font-dm-sans), system-ui, sans-serif;
  --font-display: var(--font-sora), var(--font-dm-sans), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, monospace;

  --shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12);
  --shadow-card-hover: 0 4px 12px rgba(6, 182, 212, 0.14), 0 20px 40px -20px rgba(8, 145, 178, 0.28);
}
```

**Remove** all `@theme` remaps of `--color-blue-*` and `--color-slate-*` to brand blues (those hijacks caused faint/invisible text).

- [ ] **Step 2: Update `html.dark` token overrides**

```css
html.dark {
  --color-primary: #22d3ee;
  --color-primary-hover: #67e8f9;
  --color-accent-quiet: #818cf8;
  --color-secondary: #1e293b;
  --color-soft: #164e63;
  --color-ink: #f1f5f9;
  --color-ink-muted: #cbd5e1;
  --color-ink-faint: #94a3b8;
  --color-canvas: #0b1220;
  --color-panel: #111827;
  --color-stage: #020617;

  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.35), 0 8px 24px -12px rgba(0, 0, 0, 0.55);
  --shadow-card-hover: 0 4px 12px rgba(34, 211, 238, 0.18), 0 20px 40px -20px rgba(0, 0, 0, 0.65);

  color-scheme: dark;
}
```

Remove dark-mode overrides that reassigned `--color-blue-*` / `--color-slate-*`.

- [ ] **Step 3: Retune site background + stage utilities**

Update `.ai-site-bg::before` gradients to use cyan/indigo rgba (not blue-600). Add:

```css
.stage-panel {
  background:
    radial-gradient(ellipse 55% 45% at 12% 0%, rgba(79, 70, 229, 0.35), transparent 55%),
    radial-gradient(ellipse 50% 40% at 88% 60%, rgba(6, 182, 212, 0.28), transparent 50%),
    var(--color-stage);
  color: #f8fafc;
}

@media (prefers-reduced-motion: no-preference) {
  .stage-panel {
    background-size: 120% 120%, 120% 120%, auto;
    animation: stage-drift 18s ease-in-out infinite alternate;
  }
}

@keyframes stage-drift {
  from { background-position: 0% 0%, 100% 50%, center; }
  to { background-position: 20% 10%, 80% 40%, center; }
}

.card-hover article {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
}

@media (prefers-reduced-motion: reduce) {
  .stage-panel { animation: none; }
  .card-hover article { transition: none; }
}

.featured-bento {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .featured-bento {
    grid-template-columns: 1.35fr 1fr 1fr;
  }
}

.featured-bento > :first-child {
  /* first card spans visually wider via grid track; no extra class required */
}
```

Keep `.marketplace-grid` and `.field-control` focus rings (already use `primary`).

- [ ] **Step 4: Smoke-check token wiring**

Run: `cd rampungin && npm run dev` (if not already) and open home — text should be near-black on `#F8FAFC`, not washed-out blue-grey.

- [ ] **Step 5: Commit**

```bash
git add rampungin/src/app/globals.css
git commit -m "$(cat <<'EOF'
style(rampungin): retokenize Gallery Stage palette and contrast

EOF
)"
```

---

### Task 3: Logo refresh + mono font + theme-color

**Files:**
- Modify: `public/brand/rampungin-mark.svg`
- Modify: `src/components/RampunginLogo.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `public/manifest.json` (theme/background if present)

**Interfaces:**
- Produces: indigo→cyan mark; `--font-jetbrains-mono` on `<body>`
- Consumes: Task 2 `--font-mono`

- [ ] **Step 1: Update SVG mark gradients**

In `public/brand/rampungin-mark.svg`, change gradient stops to:

```svg
<stop stop-color="#4f46e5"/>
<stop offset="0.45" stop-color="#06b6d4"/>
<stop offset="1" stop-color="#22d3ee"/>
```

Spark fill: `#e0f2fe` (or `#a5f3fc`) instead of `#fde68a`. Keep paths/silhouette.

- [ ] **Step 2: Mirror stops in `RampunginLogo.tsx`**

Update comment to “indigo→cyan”. Same stop colors as the SVG. Spark fill `#a5f3fc`.

- [ ] **Step 3: Add JetBrains Mono in `layout.tsx`**

```tsx
import { DM_Sans, JetBrains_Mono, Sora } from "next/font/google";

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});
```

Add `mono.variable` to `<body className=...>`. Set:

```tsx
<meta name="theme-color" content="#06b6d4" />
```

- [ ] **Step 4: Update `public/manifest.json` theme_color / background_color to `#06b6d4` / `#f8fafc` if those keys exist.**

- [ ] **Step 5: Commit**

```bash
git add rampungin/public/brand/rampungin-mark.svg \
  rampungin/src/components/RampunginLogo.tsx \
  rampungin/src/app/layout.tsx \
  rampungin/public/manifest.json
git commit -m "$(cat <<'EOF'
feat(rampungin): refresh logo gradient and add mono font

EOF
)"
```

---

### Task 4: Category chips with icons

**Files:**
- Modify: `src/components/CategoryChips.tsx`
- Modify: `src/app/category/[slug]/page.tsx` (header emoji → icon)

**Interfaces:**
- Consumes: `CategoryIcon`, `categoryIconName` from Task 1
- Produces: icon+label pills; active = `bg-ink text-white` or `bg-primary text-white`; inactive = border `border-secondary` + `text-ink-muted`

- [ ] **Step 1: Restyle `CategoryChips`**

Replace emoji `<span aria-hidden>{c.emoji}</span>` with:

```tsx
import { CategoryIcon } from "./CategoryIcon";
import { CATEGORIES, categoryIconName, categoryLabel } from "@/lib/categories";

// All chip:
<CategoryIcon name="squares-four" size={14} className="shrink-0" />

// Each category:
<CategoryIcon name={c.icon} size={14} className="shrink-0" />
```

Active classes: `bg-ink text-white` (or `bg-primary text-white` — pick **primary** for active to match CTA accent).  
Inactive: `border border-secondary bg-panel text-ink-muted hover:bg-soft hover:text-ink`.  
Container: `border-b border-secondary bg-panel/90 backdrop-blur`.

- [ ] **Step 2: Category page header**

In `src/app/category/[slug]/page.tsx`, replace any `categoryEmoji(...)` display with `<CategoryIcon name={categoryIconName(slug)} />` next to the title (client island or small wrapper if page is server — pass icon name string and render via a tiny server-safe approach: either make a server-compatible SVG map, or wrap header badge in a client `CategoryHeading` component).

Preferred: create no extra file — import `CategoryIcon` (client) into a thin client `CategoryPageHeading` only if the page is a Server Component and cannot import client icons directly. Next.js allows importing client components into server pages — so import `CategoryIcon` directly in the page.

- [ ] **Step 3: Manual check**

Open `/` and `/category/coding` — icons visible, no emoji in chips.

- [ ] **Step 4: Commit**

```bash
git add rampungin/src/components/CategoryChips.tsx \
  rampungin/src/app/category/[slug]/page.tsx
git commit -m "$(cat <<'EOF'
feat(rampungin): use Phosphor icons on category chips

EOF
)"
```

---

### Task 5: Frosted header + footer chrome

**Files:**
- Modify: `src/components/SiteHeader.tsx`
- Modify: `src/components/SiteFooter.tsx`

**Interfaces:**
- Consumes: Task 2 tokens (`bg-panel`, `border-secondary`, `bg-primary`)
- Produces: frosted sticky header; Share as only solid cyan CTA

- [ ] **Step 1: Update header shell classes**

Replace outer header classes roughly with:

```tsx
<header className="sticky top-0 z-40 border-b border-secondary/80 bg-panel/85 backdrop-blur-md">
```

Ensure Share / Create CTA uses `bg-primary text-white hover:bg-primary-hover` (not old blue assumptions). Nav links: `text-ink-muted hover:bg-soft hover:text-ink`. Search skeleton/loading pill: `bg-soft` with readable placeholder.

- [ ] **Step 2: Restyle footer**

`border-t border-secondary bg-panel text-ink-muted`; links `hover:text-ink`.

- [ ] **Step 3: Visual check** — header readable in light + dark; Share button cyan.

- [ ] **Step 4: Commit**

```bash
git add rampungin/src/components/SiteHeader.tsx rampungin/src/components/SiteFooter.tsx
git commit -m "$(cat <<'EOF'
style(rampungin): frost header and restyle footer chrome

EOF
)"
```

---

### Task 6: Gallery Stage home (hero + featured bento)

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `.stage-panel`, `.featured-bento`, existing `CardGrid` / featured data
- Produces: stage hero when `!q`; featured section uses bento grid; search mode unchanged (no hero/featured)

- [ ] **Step 1: Replace centered hero section**

When `!q`, replace the current centered hero with a stage card:

```tsx
<section className="animate-fade-up py-6 sm:py-8">
  <div className="stage-panel relative overflow-hidden rounded-2xl px-5 py-8 sm:rounded-3xl sm:px-10 sm:py-12">
    <p className="mb-3 text-xs font-semibold text-white/70">
      {t("heroBadge")} · {totalCatalog}+ {t("promptCountSuffix")}
    </p>
    <h1 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
      {t("heroTitle")}
    </h1>
    <p className="mt-3 max-w-xl text-sm text-slate-200 sm:text-lg">
      {t("heroSubtitle")}
    </p>
    <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
      <LocaleLink
        href="/prompts/new"
        className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover sm:px-5"
      >
        {t("heroShare")}
      </LocaleLink>
      <LocaleLink
        href="/trending"
        className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15 sm:px-5"
      >
        {t("heroTrending")}
      </LocaleLink>
    </div>
  </div>
</section>
```

Note: use `text-white/70` and `text-slate-200` only on the stage (dark) surface — elsewhere prefer `text-ink*`. If `slate-200` is not themed, use `text-white/80` instead for safety.

- [ ] **Step 2: Featured bento wrapper**

Change featured `CardGrid` wrapper from `marketplace-grid` to a dedicated structure:

Option A (minimal): add prop `variant?: "grid" | "bento"` to `CardGrid` in `page.tsx` only:

```tsx
function CardGrid({ ..., variant = "grid" }: { variant?: "grid" | "bento"; ... }) {
  return (
    <div className={variant === "bento" ? "featured-bento" : "marketplace-grid"}>
      ...
    </div>
  );
}
```

Featured call: `<CardGrid ... variant="bento" priorityCount={2} />`.  
On mobile, `.featured-bento` is 1-col; on `md+` first track is wider — first featured item naturally sits in the wide cell.

- [ ] **Step 3: Section titles** use `text-ink` / `text-ink-muted`; “See all” links `text-primary hover:underline`.

- [ ] **Step 4: Manual check** — `/` shows stage; `/?q=writing` hides stage + featured.

- [ ] **Step 5: Commit**

```bash
git add rampungin/src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat(rampungin): Gallery Stage home hero and featured bento

EOF
)"
```

---

### Task 7: PromptCard restyle

**Files:**
- Modify: `src/components/PromptCard.tsx`

**Interfaces:**
- Consumes: `CategoryIcon`, `categoryIconName`, tokens `accent-quiet`, `ink-faint`
- Produces: icon category badge; indigo pin chips; cyan hover; no emoji; meta uses `text-ink-faint`

- [ ] **Step 1: Category badge**

Replace emoji category span with:

```tsx
<span className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-panel/95 px-1.5 py-0.5 text-[10px] font-semibold text-ink shadow-sm backdrop-blur sm:text-[11px]">
  <CategoryIcon name={categoryIconName(category)} size={12} />
  <span className="hidden truncate sm:inline">
    {categoryLabel(category, locale)}
  </span>
</span>
```

Remove `categoryEmoji` import if unused.

- [ ] **Step 2: Pin badges**

Editor pick / admin pin: use `bg-accent-quiet text-white` (not amber). Template badge: outline or soft cyan, not competing orange.

- [ ] **Step 3: Card chrome**

Article: `rounded-2xl bg-panel shadow-card ring-1 ring-secondary group-hover:-translate-y-1 group-hover:shadow-card-hover`.  
Cover image hover scale: `group-hover:scale-[1.03]` (was 1.05).  
Title: `text-ink`; meta row: `text-ink-faint` (not muted for long title — title stays ink).

- [ ] **Step 4: Commit**

```bash
git add rampungin/src/components/PromptCard.tsx
git commit -m "$(cat <<'EOF'
style(rampungin): restyle prompt cards with icons and contrast

EOF
)"
```

---

### Task 8: Prompt detail + auth/forms polish

**Files:**
- Modify: `src/app/profile/[username]/prompt/[id]/page.tsx` (and/or `src/app/prompts/[id]/page.tsx` if still used)
- Modify: `src/app/auth/page.tsx`
- Modify: primary buttons in `src/components/PromptEditorForm.tsx`, `PromptForm.tsx`, `GoogleLoginButton.tsx` only as needed for `bg-primary` readability (`text-white`)

**Interfaces:**
- Consumes: mono font token `font-mono`, `CategoryIcon`, primary/accent-quiet
- Produces: readable detail action strip; mono prompt body; auth panel on canvas

- [ ] **Step 1: Detail meta + actions**

On the main prompt detail page:

- Category row: `<CategoryIcon name={categoryIconName(category)} />` + label
- Primary Copy / generate CTA: `rounded-xl bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-hover`
- Secondary actions: `rounded-xl border border-secondary bg-panel ...`
- Pin controls: quiet indigo (`bg-accent-quiet/15 text-accent-quiet` or solid indigo for active)

- [ ] **Step 2: Prompt body**

Wrap prompt text preview in:

```tsx
<pre className="overflow-x-auto rounded-2xl bg-stage p-4 font-mono text-sm leading-relaxed text-white/90">
```

Highlight `{{placeholders}}` with `<span className="text-primary">` if the page already splits tokens; if not, skip highlighting (YAGNI) — mono stage block alone satisfies the spec’s readability bar.

- [ ] **Step 3: Auth page**

Centered `max-w-md rounded-2xl border border-secondary bg-panel p-6 shadow-card` on canvas; logo on top; Google button primary cyan with white text.

- [ ] **Step 4: Forms**

Ensure submit buttons use `bg-primary text-white hover:bg-primary-hover`. Field labels `text-ink`; help text `text-ink-muted`.

- [ ] **Step 5: Commit**

```bash
git add rampungin/src/app/profile/[username]/prompt/[id]/page.tsx \
  rampungin/src/app/prompts/[id]/page.tsx \
  rampungin/src/app/auth/page.tsx \
  rampungin/src/components/PromptEditorForm.tsx \
  rampungin/src/components/PromptForm.tsx \
  rampungin/src/components/GoogleLoginButton.tsx
git commit -m "$(cat <<'EOF'
style(rampungin): polish detail, auth, and form accents

EOF
)"
```

---

### Task 9: Cover gradient cohesion + sweep + verify

**Files:**
- Modify: `src/lib/categories.ts` (`cover` gradients — optional retune toward indigo/cyan family while keeping category distinction)
- Modify: any remaining `bg-amber-*` / old blue-only marketing chips in header/about if they break the one-accent rule (semantic errors may stay red)
- Test: full suite

**Interfaces:**
- Consumes: all prior tasks
- Produces: verified build

- [ ] **Step 1: Soft-retune category covers**

Adjust each `cover` string so they still differentiate categories but lean cool (indigo/cyan/teal/violet) — avoid loud orange/amber covers unless Entertainment needs warmth. Keep Tailwind gradient class shape: `from-[#...] via-[#...] to-[#...]`.

- [ ] **Step 2: Grep leftover emoji UI**

Run: `cd rampungin && rg "categoryEmoji|📣|💻|emoji" src/components src/app -n`

Expected: no user-facing category emoji in chips/cards/headers (helper may remain in `categories.ts`).

- [ ] **Step 3: Run verification**

```bash
cd rampungin
npm test
npm run lint
npm run build
```

Expected: all pass. Fix any TypeScript errors from Phosphor icon renames or class tokens.

- [ ] **Step 4: Manual visual checklist**

- [ ] Home stage hero (light + dark)
- [ ] Search mode hides stage
- [ ] Category icons on chips + cards
- [ ] Body text readable (ink / muted / faint)
- [ ] Copy CTA cyan; pins indigo
- [ ] `prefers-reduced-motion`: stage not drifting

- [ ] **Step 5: Commit**

```bash
git add rampungin/src/lib/categories.ts
# plus any sweep files touched
git commit -m "$(cat <<'EOF'
style(rampungin): retune covers and finish Gallery Stage sweep

EOF
)"
```

---

## Spec coverage checklist

| Spec section | Task(s) |
|---|---|
| Color tokens + no slate hijack + contrast | 2 |
| Typography + mono | 3 |
| Logo refresh + theme-color | 3 |
| Phosphor category icons | 1, 4, 7 |
| Frosted header / Share CTA | 5 |
| Stage hero | 6 |
| Category rail | 4 |
| Featured bento | 6 |
| Latest/search grid unchanged | 6 |
| Prompt card | 7 |
| Prompt detail + mono body | 8 |
| Forms / auth / profiles accents | 8 |
| Motion + reduced-motion | 2, 6, 7 |
| Cover retune | 9 |
| Verification | 9 |

## Self-review notes

- No TBD placeholders; Phosphor name mismatches handled with explicit “adjust MAP” instruction in Task 1
- `categoryIconName("all")` supports All chip
- Detail placeholder highlighting is optional if splitting is absent — mono stage block is required
