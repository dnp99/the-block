# The Block — Build Plan

Buyer-side vehicle auction prototype (OPENLANE "The Block" challenge).
Single Next.js app, Vercel-only. AI-first. Full architecture/decisions live in
`CLAUDE.md` (enforced rules) and `docs/design-system.md` (design spec).

## Working agreement

- Build in **vertical slices** — each is independently demoable.
- Every slice ends **green**: `npm run typecheck`, `npm run lint`, `npm run build` pass.
- After each slice: **commit with a Conventional Commit message** (`feat:` / `fix:` /
  `chore:` / `test:` / `docs:`), then **pause for review** before the next.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind v4 (`@theme` tokens) ·
Anthropic SDK (`claude-haiku-4-5`, server-only) · Vitest. Data: `data/vehicles.json`
(200 vehicles, static bundled import). No DB, no auth.

## Slices

| Commit | Slice | Delivers | Status |
|--------|-------|----------|--------|
| `chore: scaffold …` | **Scaffold** | Next + Tailwind v4 tokens, theming, tooling, build green | ✅ done |
| `feat: browse inventory` | **Browse inventory** | Search page: header + card grid + filter/sort over static data | ⏳ next |
| `feat: vehicle detail page` | **Vehicle detail (VDP)** | `/vehicle/[id]`: carousel, specs, condition, damage, dealer; `not-found` | ⬜ |
| `feat: bidding` | **Bidding** | Sticky bid footer, localStorage (versioned), inline validation, reserve met/not-met. **Minimum bar complete.** | ⬜ |
| `feat: ai natural-language search` | **AI NL search** | `/api/search` + Claude + `lib/prompts.ts`; debounce/cache/keyword-fallback/toast + empty state | ⬜ |
| `feat: ai condition summary` | **AI condition summary** | `/api/condition-summary` on VDP; skeleton + cache + toast fallback | ⬜ |
| `feat: live auction state` | **Live auction state** | Normalize `auction_start` → upcoming/live/ended pill + countdown | ⬜ |
| `feat: polish & accessibility` | **Polish & a11y** | `error.tsx`, ThemeToggle, focus/keyboard/safe-area, mobile, empty/loading states | ⬜ |
| `test: …` / `docs: …` | **Tests + docs** | Vitest (filters/bids/search-parser), `docs/design-system.md`, README (submission + AI-usage) | ⬜ |
| `chore: release` | **Submission** | Final pass, deploy, share link | ⬜ |

## Acceptance per slice

- **Browse:** grid renders 200 vehicles; search box + filters narrow results; sort works; responsive; empty state.
- **VDP:** every card opens a detail page; all spec/condition/dealer fields shown; bad id → not-found.
- **Bidding:** place a bid above current → persists across refresh; too-low → inline error; reserve met/not-met shown, reserve price never revealed.
- **AI search:** natural-language query → structured filters applied; AI failure → keyword fallback + toast; no match → empty state.
- **AI condition:** VDP shows AI trust summary above raw details; failure → toast, raw details still render; cached per id.
- **Live state:** cards/VDP show upcoming/live/ended + countdown, normalized to now.

## Scope guardrails (do NOT build)

Auth/accounts · seller workflows · checkout/payments · dealer admin · any backend beyond the Claude proxy.
