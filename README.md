<p align="center">
  <img src="docs/the_block_repo.png" alt="The Block" width="880" />
</p>

# Openlane — The Block

Buyer side of a vehicle auction platform. Browse 200 vehicles, inspect details, and place
bids — with two **AI-first** features layered on top: natural-language search and an
AI condition summary.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4**, with
**Claude (Haiku 4.5)** behind server-side API routes. Bids persist client-side; there is no
database or auth.

**▶ Live demo: https://the-block-virid.vercel.app** — AI features are enabled, so you can try
natural-language search and the condition summary with no setup.

---

## How to run

```sh
git clone https://github.com/dnp99/the-block.git
cd the-block
npm install
npm run dev          # http://localhost:3000
```

That's it for the core app — **browse, search (keyword), vehicle details, and bidding all
work with no setup.**

### Enabling the AI features (optional)

The two AI features call the Anthropic API. To turn them on, add a key:

```sh
cp .env.example .env.local
# edit .env.local and set:
# ANTHROPIC_API_KEY=sk-ant-...
npm run dev          # restart so the env loads
```

Get a key at [console.anthropic.com](https://console.anthropic.com). Cost is a fraction of a
cent per call (Haiku, tiny token caps). **Without a key, the app degrades gracefully** —
natural-language search falls back to keyword search (with a toast), and the condition
summary is simply skipped (raw details still show). The key is read **only** server-side in
the API routes and never reaches the browser.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (:3000) |
| `npm run build` | Production build |
| `npm run test` | Vitest (28 tests) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4
  (CSS-first `@theme` tokens), Radix Slider (range filters)
- **i18n:** next-intl (EN/FR, cookie locale, FR-CA formatting)
- **Backend:** Next.js Route Handlers — only to proxy Claude (`/api/search`,
  `/api/condition-summary`). No standalone server.
- **AI:** Anthropic SDK, `claude-haiku-4-5`, server-side only
- **Persistence:** `localStorage` for bids (versioned + type-guarded). Dataset is a static
  bundled import of `data/vehicles.json`.
- **Tests:** Vitest

---

## What I built

**Browse**
- List of all 200 vehicles with a small thumbnail, specs, condition/title/damage pills, and
  live bid info
- **Auction status tabs** — All / Live / Upcoming / Ended with live counts
- Filters in a left rail (Make, Body, Province, Condition) + **range sliders** (Year,
  Odometer, Price); active filters shown as removable chips
- **Quick bid / Buy now** directly from a card (two-step confirm), plus sort and pagination
- Responsive: compact rows that re-flow for mobile

**Vehicle detail**
- Photo gallery (hero + thumbnails, arrow/keyboard nav)
- Specs, **condition & disclosures** (visual grade gauge, title-risk explainer, severity-
  tagged damage notes), selling dealership
- **Sticky bid panel/bar** — place bid (with ±$100 stepper), buy now, reserve met/not-met
  (price hidden), live countdown, and a **bid-history modal**

**Bidding**
- Place bid, quick bid, and buy now — all reuse one validated bid path
- **Persists across refresh** (localStorage) and stays in sync across the card, the detail
  page, and the bid history (reactive via `useSyncExternalStore`)

**Bilingual (EN / FR)**
- Full **English / French** UI via next-intl — on-brand for a Canadian (bilingual) marketplace
- **EN/FR toggle** in the header; locale persists in a cookie and resolves **server-side**, so
  the right language is in the initial HTML (no flash) and `<html lang>` is correct
- **FR-CA formatting** — currency/numbers localize (**`$25,000` ↔ `25 000 $`**), as do
  countdowns and plurals ("1 bid" / "1 enchère")
- Covered: browse, filters, cards, the **full bidding flow**, toasts, and error/not-found pages.
  *Deferred (phase 2):* the vehicle-detail descriptive body and the AI summary text stay English
  — see [ADR 0004](docs/DECISIONS.md)

**AI (the differentiators)**
- **Natural-language search** — e.g. *"AWD SUV under $20k, clean title in Ontario"* →
  Claude returns structured filters (via forced tool-use) → applied to the list, shown as
  editable ✨ chips
- **Condition summary** — a grounded 2–3 sentence "should I trust this?" read on the detail
  page, generated from the grade + inspector report + damage + title

---

## Notable decisions

System diagrams and the layer breakdown are in **[`docs/architecture.md`](docs/architecture.md)**;
full decision rationale (with alternatives rejected) lives in
**[`docs/DECISIONS.md`](docs/DECISIONS.md)**. Highlights:

- **Next.js single app over Vite + a separate backend** — the AI features need a server
  boundary to keep the API key secret; one app means one deploy and the simplest
  clone-and-run. (ADR 0001)
- **Auction times are synthetic** (the dataset's `auction_start` is all in the past), so they
  are **normalized to "now"** deterministically — giving a realistic mix of live/upcoming/
  ended with working countdowns. The challenge's data note explicitly permits this. (ADR 0002)
- **Bid history is reconstructed** — the dataset has only a bid *count*, no per-bid history,
  so the history modal synthesizes plausible prior bids and overlays your real local bids.
  Clearly labeled in the UI. (ADR 0003)
- **Never trust raw LLM output** — every Claude response is parsed through a runtime
  validator (`parseSearchFilters`); bad/unknown fields are dropped, and any failure falls
  back gracefully. AI is purely additive, never a dependency.
- **Reserve is shown as met/not-met only** — the reserve *price* stays hidden, mirroring real
  auctions.
- **Design system in one place** — tokens live only in `app/globals.css` `@theme`; see
  **[`docs/design-system.md`](docs/design-system.md)**.

---

## How I used AI

AI was used both **to build this** and **inside the product**, as expected for an AI-first
role.

### In the product
- Two Claude features behind server-side route handlers (key never client-side).
- **Structured output via forced tool-use** for search — Claude must call an `apply_filters`
  tool, so it returns validated JSON, not prose. The condition summary uses a tightly-scoped
  prompt ("only from the data provided; no price; no bid advice").
- **Defensive by design:** per-IP rate limit, per-query cache, 600 ms debounce, keyword
  fallback + toast on failure, and validation of every response.

### To build it
I used Claude Code throughout — planning, scaffolding, and implementation in small,
reviewable slices (see [`docs/PLAN.md`](docs/PLAN.md)), each committed with conventional
messages.

**Where the AI was wrong and I corrected it:**
- It first proposed the **Tailwind v3 `tailwind.config.js`** pattern; v4 is CSS-first
  (`@theme`), so I corrected it before it caused tooling friction.
- Its initial plan was **Vite + Express + Railway**; I reconsidered to a single Next.js app
  (Vercel-only) for a secure key + simpler clone-and-run.
- The data validator was **too strict** (required a numeric `current_bid`) — it would have
  silently dropped **112 of 200 vehicles** that have `current_bid: null` (no bids yet). Caught
  it and fixed the contract to allow null.
- `placehold.co` serves **SVG**, which Next's image optimizer rejects — debugged the broken
  images and rendered them `unoptimized` with a branded fallback tile.
- An early **hardcoded condition blurb** ("mechanically sound") could contradict the real
  inspector report on some vehicles — removed it and let the *grounded* AI summary handle it
  instead.

**What I'd refine:** add a small eval/snapshot harness for the search-parse prompt across a
set of example queries; stream the condition summary; and move the in-memory rate-limit/cache
to a shared store for multi-instance deploys.

---

## Testing

`npm run test` — **35 Vitest tests** over the pure logic that matters:

- `lib/filters` — filter + sort, price/odometer/year ranges, no-bid handling
- `lib/bids` — minimum-bid rules, place-bid persistence, store parsing
- `lib/bidDisplay` — phase-aware bid label/amount/actions (upcoming / live / sold / no-sale)
- `lib/contracts/search` — `parseSearchFilters` validator (drops bad/unknown LLM output)
- `lib/auction` — phase derivation + countdown formatting
- `lib/bidHistory` — deterministic history reconstruction

Plus `npm run typecheck` and `npm run lint` are clean, and `npm run build` passes.

---

## Time spent

Roughly a focused build over a few sessions. I deliberately went past the 3–4h suggestion to
take the two AI features and the UX/polish further, since this is an AI-first role — but the
**minimum bar (browse → detail → bid, desktop + mobile) was the first thing standing**, and
everything after is layered on top.

---

## What I'd do with more time

- **Finish i18n** — translate the vehicle-detail descriptive body, add **locale-aware Claude
  prompts** (a French condition summary), and `/en` `/fr` URL routing for SEO
- **Watchlist** (save vehicles) and a saved-searches view
- **Vehicle compare** (AI side-by-side verdict on two vehicles)
- A live **bid feed** on the detail page, and outbid notifications
- Real photos / a richer gallery (lightbox, zoom)
- Search-prompt evals + condition-summary streaming

---

## Project layout

```
app/                     # routes — pages + api (Claude proxy)
components/               # ui primitives, search, vehicle, layout
lib/                      # contracts, data, filters, bids, auction, claude, prompts, i18n (+ tests)
messages/                 # en.json / fr.json translation catalogs
i18n/request.ts           # next-intl server config (cookie locale)
data/vehicles.json        # the 200-vehicle dataset
docs/                     # architecture.md, DECISIONS.md, design-system.md, PLAN.md
CLAUDE.md / AGENTS.md      # agent guardrails (design rules, AI conventions)
```
