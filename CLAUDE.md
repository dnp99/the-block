# The Block — Claude Instructions

Buyer-side vehicle auction prototype for the OPENLANE "The Block" challenge.
AI-first build. Optimize for clarity, craft, and sensible scope over surface area.

## Stack

- **Next.js (App Router)** + React + TypeScript
- **Tailwind CSS v4** — CSS-first `@theme` tokens in `app/globals.css` (no `tailwind.config.js`)
- **Anthropic SDK** (`claude-haiku-4-5`) — called only from server-side API routes
- **Data:** `data/vehicles.json` (200 vehicles), static bundled import (`import vehicles from "@/data/vehicles.json"`)
- **No** database, auth, or separate backend — API routes exist only to proxy Claude

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest |

## Pre-commit checklist (mandatory)

Run all three and fix every failure before committing. Never commit red.

```sh
npm run lint
npm run typecheck
npm run test
```

## Design system (mandatory)

**Canonical spec: [`docs/design-system.md`](docs/design-system.md) — read it before any UI work.**
The rules below are the always-in-context enforced subset; the spec is the full reference.
Token **values** live only in `app/globals.css` under `@theme` — never repeat hex/spacing values
in this file or the spec; reference token *names* (`bg-surface`, `primary-600`) instead.

Components consume Tailwind utilities generated from those tokens — **never hardcode hex colors
or arbitrary spacing**.

Semantic token names (chosen to avoid doubled class names and a collision with the `primary`
brand scale): surfaces `bg-canvas` / `bg-surface` / `bg-elevated`; text `text-ink` / `text-ink-muted`
/ `text-ink-subtle`; borders `border-line` / `border-line-strong`; brand `primary-{50..900}`;
semantic `success` / `warning` / `error`.

1. **Surfaces:** page canvas = `bg-canvas` (slate-50); cards/inputs = `bg-surface` (white). Never gray cards.
2. **Borders:** default `border-line` (slate-200), hover `border-line-strong` (slate-300). Never default to the strong border.
3. **Buttons:** primary `bg-primary-600 hover:bg-primary-700 text-white`; secondary slate-100 → slate-200, no border.
4. **Radius:** `rounded-2xl` cards/sections, `rounded-xl` buttons/inputs/pills.
5. **Shadows:** one level per element — `shadow-sm` for cards. Never stack.
6. **Spacing:** 4px scale only — 4 / 8 / 12 / 16 / 24 / 32.
7. **Color semantics:** blue = selection, green = success, amber = warning, red = error. Never mix meanings.
   Status pills: clean title = blue, damage/issue = red, reserve-not-met = amber, bid accepted = green.
8. **States:** every interactive component handles all 8 — default, hover, focus, disabled, selected, error, loading, empty.
9. **Loading = skeletons, never spinners.**
10. **Mobile:** 44px min touch targets; tables collapse to cards below `md`; buttons `w-full sm:w-auto`.
11. **Dark mode:** `.dark` on `<html>`; every token has a dark variant.
12. **Naming:** Card (static) · Panel (interactive/collapsible) · Pill (inline badge) · Section (page grouping).

## AI integration (mandatory)

- **Key is server-only.** Read `ANTHROPIC_API_KEY` only inside `app/api/**/route.ts`. Never use
  `NEXT_PUBLIC_`. Local: `.env.local` (gitignored). Prod: Vercel env vars.
- **All Claude calls go through API routes** (`/api/search`, `/api/condition-summary`). The client
  never calls Anthropic directly.
- **Prompts live in `lib/prompts.ts`** — versioned, commented, with an explicit output schema.
- **Never trust raw model output.** Parse every Claude response through a `lib/contracts` runtime
  validator. On invalid or failed output, fall back gracefully (keyword search / hide summary) —
  never crash, never block the UI.
- **Every AI call:** debounce (search 600ms, min 3 chars), cache by key, and a fallback path.
  Token caps: search 150, condition 200.

## Error handling

- **Non-blocking** (AI search/summary fail, bid-save throws) → **toast**, degrade in place.
- **Fatal** → **error page**: `not-found.tsx` (missing vehicle id), `error.tsx` (boundary).
- **Bid too low / invalid** → **inline** error under the input, not a toast.

## Bids

Client-side only — `localStorage`, versioned + type-guarded (`lib/bids.ts`). Optimistic update.
Reject bids ≤ current bid. **Never reveal the reserve price** — show "reserve met / not met" only.

## Out of scope (do not build)

Authentication / accounts, seller workflows, checkout / payments, dealer admin tooling,
or any real backend beyond the Claude proxy.
