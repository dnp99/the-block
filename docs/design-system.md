# The Block — Design System

The full design-system spec. `CLAUDE.md` carries the enforced subset (always in an agent's
context); this file is the complete reference.

> **One source of truth for values.** Token **values** (hex, radii, shadows) live only in
> `app/globals.css` under `@theme`. This document and `CLAUDE.md` reference token **names**
> (`bg-surface`, `primary-600`) — never raw hex — so nothing drifts.

---

## 1. Principles

1. **Tokens, not literals.** Components use Tailwind utilities generated from `@theme`
   tokens. Never hardcode a hex color or an arbitrary spacing value.
2. **One shadow level per element.** Never stack shadows.
3. **Color carries meaning** — see §4. Blue, green, amber, red each mean one thing.
4. **Cards are white, the page is the canvas.** Contrast comes from `bg-canvas` behind
   `bg-surface`, never from graying the card.
5. **Loading is a skeleton, never a spinner.**
6. **Every state is handled** — see §8.

## 2. Where things live

```
app/globals.css        → token VALUES (the only place hex/radius/shadow live)
docs/design-system.md  → this file — full spec, names + rationale
CLAUDE.md              → enforced subset, always in agent context
```

Dark mode is a `.dark` class on `<html>`; tokens remap underneath, so the same markup
themes correctly with no per-component color variants.

## 3. Color tokens

Reference by name. Values are in `@theme`.

| Scale | Tokens | Purpose |
|-------|--------|---------|
| Brand | `primary-50` … `primary-900` | Actions, selection, focus rings, links |
| Neutral | `neutral-50` … `neutral-950` | Surfaces, text, borders (slate) |
| Success | `success`, `success-soft` | Bid accepted / good condition |
| Warning | `warning`, `warning-soft` | Reserve not met / caution |
| Error | `error`, `error-soft` | Damage, salvage, invalid input |

### Semantic aliases (use these in components)

These remap between light and dark — prefer them over raw `neutral-*` for surfaces/text/borders.

| Utility | Token | Light | Dark |
|---------|-------|-------|------|
| `bg-canvas` | `--color-canvas` | neutral-50 | neutral-950 |
| `bg-surface` | `--color-surface` | white | neutral-900 |
| `bg-elevated` | `--color-elevated` | white | neutral-800 |
| `text-ink` | `--color-ink` | neutral-900 | neutral-100 |
| `text-ink-muted` | `--color-ink-muted` | neutral-600 | neutral-300 |
| `text-ink-subtle` | `--color-ink-subtle` | neutral-400 | neutral-500 |
| `border-line` | `--color-line` | neutral-200 | neutral-800 |
| `border-line-strong` | `--color-line-strong` | neutral-300 | neutral-700 |

> **Why these names?** `--color-bg-surface` would generate the doubled class `bg-bg-surface`,
> and `text-primary` would collide with the `primary` brand scale. `canvas`/`surface`/`ink`/
> `line` avoid both. (See `DECISIONS.md` for the token-naming note.)

## 4. Color semantics

One meaning per color — never mix.

| Color | Means | Examples |
|-------|-------|----------|
| **Blue** (`primary`) | Information / selection / focus | Clean title pill, selected state, focus ring, primary button |
| **Green** (`success`) | Good / accepted | Condition grade ≥ 4, bid accepted, reserve met |
| **Amber** (`warning`) | Caution | Condition 2.5–4, rebuilt title, reserve **not** met |
| **Red** (`error`) | Problem | Condition < 2.5, salvage title, invalid bid |

**Vehicle mappings** (implemented in `components/vehicle/vehiclePills.ts`):
- Condition grade: `≥4` green · `2.5–4` amber · `<2.5` red
- Title status: `clean` blue · `rebuilt` amber · `salvage` red

## 5. Spacing, radius, shadow

- **Spacing:** Tailwind's 4px scale only — `4 / 8 / 12 / 16 / 24 / 32`. No custom `--space-*`.
- **Radius:** `rounded-2xl` cards/sections · `rounded-xl` buttons/inputs/pills · `rounded-full` pills/avatars.
- **Shadow:** `shadow-sm` for cards. One level per element — never stack. Tokens `--shadow-sm/md/lg`.

## 6. Typography

- Family: **Inter** via `next/font`, exposed as `--font-sans` (utility `font-sans`).
- Scale: Tailwind's `text-xs … text-4xl`; weights `font-normal / medium / semibold / bold`.
- Headings `text-ink`; secondary copy `text-ink-muted`; meta `text-ink-subtle`.

## 7. Components

| Component | File | Variants / API | Status |
|-----------|------|----------------|--------|
| `Button` | `components/ui/Button.tsx` | `primary` / `secondary` / `ghost` × `sm` / `md` / `lg` | ✅ |
| `Card` | `components/ui/Card.tsx` | Static white surface, `border-line`, `shadow-sm` | ✅ |
| `Pill` | `components/ui/Pill.tsx` | tone `neutral` / `blue` / `green` / `amber` / `red` | ✅ |
| `Skeleton` | `components/ui/Skeleton.tsx` | Pulsing placeholder (no spinners) | ✅ |
| `Input` / `SearchInput` | — | Text input with icon slot | ⏳ planned (inlined for now) |
| `ThemeToggle` | — | Sun/moon, toggles `.dark`, persists to `localStorage` | ⏳ Slice 7 |
| `CountdownPill` | — | upcoming / live / ended + countdown | ⏳ Slice 6 |
| `Toaster` | — | provider + `toast()` for non-blocking errors | ⏳ Slice 4 |

### Buttons
- **Primary:** `bg-primary-600 hover:bg-primary-700 text-white`.
- **Secondary:** `bg-neutral-100 hover:bg-neutral-200` (dark: `neutral-800/700`) — **no border**.
- **Ghost:** transparent, `text-ink-muted`, hover tint.
- Destructive actions are **red text**, not a red button.

## 8. Component states (the 8-state rule)

Every interactive component must handle all of:

`default · hover · focus · disabled · selected · error · loading · empty`

- **Focus:** `focus-visible:ring-2 ring-primary-500` (+ offset on solid surfaces). Never remove
  an outline without replacing it.
- **Disabled:** `disabled:opacity-60 disabled:cursor-not-allowed` — never hidden.
- **Selected/active:** `border-primary-200 bg-primary-50/50` (blue = selection only).
- **Loading:** skeletons. **Empty:** centered `text-ink-muted` message with an action.

## 9. Naming conventions

| Term | Means |
|------|-------|
| **Card** | Static surface |
| **Panel** | Interactive / collapsible surface |
| **Pill** | Inline badge |
| **Section** | Page-level grouping |

Use these consistently in component and file names.

## 10. Layout

- Max content width: `max-w-7xl`, centered, with `px-4 sm:px-6`.
- Inventory grid: `grid-cols-2 sm:grid-cols-3 xl:grid-cols-4`.
- Page canvas: `bg-canvas`; the content wrapper is transparent.

## 11. Accessibility

| Concern | Rule |
|---------|------|
| **Focus** | Visible `focus-visible` ring on every interactive element. |
| **Touch targets** | Minimum 44×44px on tappable controls (mobile). |
| **Safe areas** | `env(safe-area-inset-*)` padding on sticky header / bid footer. |
| **Keyboard** | Carousel + modals fully operable; `Esc` closes; focus trapped in dialogs. |
| **Reduced motion** | Respect `prefers-reduced-motion` — disable countdown/skeleton animation (handled globally in `globals.css`). |
| **Dark mode** | `.dark` on `<html>`; every token has a dark counterpart; toggle persists. |
