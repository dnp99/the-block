# Architecture Decisions

A running log of notable decisions and their rationale. Newest entries appended at the
bottom. Each entry: what we decided, why, the trade-offs, and alternatives rejected.

---

## ADR 0001 — Next.js (App Router) over Vite + separate backend

- **Status:** Accepted · **Date:** 2026-06-23

**Context.** The challenge suggests "React + Vite" as one example, while stating *"none of
these are required."* Two requirements drive the choice: (1) the AI features call the
Anthropic API and the `ANTHROPIC_API_KEY` must never reach the browser; (2) the repo must
be trivial to clone and run (a graded criterion). A pure Vite app is frontend-only — it
has no server runtime to hide the key, so satisfying (1) forces a second backend service,
which works against (2).

**Decision.** Build a **single Next.js (App Router) app**, deployed to **Vercel only**.
React + Tailwind render the UI; two Route Handlers (`app/api/search`,
`app/api/condition-summary`) run server-side and proxy Claude, reading the key from
`process.env`. One repo, one `npm run dev`, one deploy.

**Consequences.**
- ✅ API key stays server-side; browser only calls same-origin `/api/*` (no CORS).
- ✅ One thing to run and deploy — no second service, no Railway, best clone-and-run story.
- ✅ SSR/metadata, file-based routing, and `next/image` for free.
- ⚠️ Next.js is heavier than Vite (more conventions, larger dep tree) — accepted for the
  server boundary. Still plain React 19; nothing Next-specific leaks into components beyond
  routing + the two API routes.

**Alternatives rejected.**

| Option | Why not |
|--------|---------|
| Vite SPA, call Claude from the browser | Leaks the API key. Unacceptable. |
| Vite SPA + separate Express/Railway backend | Secures the key but adds a second service, CORS, and a second deploy. (This was the original plan; changed.) |
| Vite SPA, mocked/no live AI | Drops the headline differentiator for an AI-first role. |
| **Next.js single app (chosen)** | Server boundary for the key, one deploy, no CORS. |

This is purely an infrastructure choice — the product would be near-identical under Vite;
the difference is *where the Claude calls run*.

## ADR 0002 — Normalize synthetic auction timestamps to a live window around "now"

- **Status:** Accepted · **Date:** 2026-06-23

**Context.** The dataset's `auction_start` values are synthetic and all in the past, so taken
literally every auction is "ended" — there'd be nothing live or upcoming to show. The challenge
explicitly allows normalizing them relative to "now" for countdowns / live states.

**Decision.** Derive each vehicle's auction schedule **deterministically** and normalize it into
a window around now:
- A stable hash of the vehicle `id` assigns a synthetic start time, **anchored to a per-request
  reference** (`anchorMs = Date.now()`, passed from the server). The start is fixed at the anchor,
  so as real time advances a vehicle moves upcoming → live → ended and countdowns tick.
- Distribution at the anchor moment: ~40% live, ~40% upcoming, ~20% ended.
- Live auctions run a **45-minute window** (matching OPENLANE's "always-on 45-minute auctions").
- The home route is `force-dynamic` so the anchor is request-time, not frozen at build.

**Consequences.**
- ✅ Realistic, populated Live / Upcoming / Ended tabs and live countdowns, with no real timestamps.
- ✅ Deterministic + hydration-safe: server and client share the same anchor, so first render
  matches; a 1s client clock then advances phases.
- ⚠️ Phases are synthetic, not real auction times — clearly a prototype normalization, documented
  here and in `lib/auction.ts`.

**Alternatives rejected.** Use the raw timestamps (everything shows as ended); random assignment
(non-deterministic — breaks SSR/hydration and is unstable across renders).

## Design & UX decisions (high level)

Captured concisely; see `git log` for the change-by-change detail.

- **Branding:** App presented as **Openlane** (the marketplace) in the header and page metadata.
- **Theme:** **Light is the default** look (matches the OPENLANE marketplace); dark mode is opt-in
  via the toggle, not driven by the OS setting.
- **Inventory layout:** **List rows**, not a card grid — fits more per row (VIN, specs, badges) and
  mirrors OPENLANE.
- **Filters:** **Left filter rail** with dual-thumb **range sliders** (Year, Odometer, Price) plus
  selects; supersedes the earlier top filter bar. Used Radix Slider for accessible keyboard/ARIA
  behavior (deliberate build-vs-buy).
- **Auction status:** Kept as **top tabs** (All / Live / Upcoming / Ended), not a left menu — status
  is a slice of one view, so tabs read better and keep rows full-width.
- **Browse UX:** Active **filter chips** (per-filter remove), **trust badges** on rows (reserve
  met/not-met with the reserve price hidden, disclosures / "No damage", Buy-now price), default sort
  **"Ending soonest"**, live countdown that turns red **"Ending soon"** under 2 min, **Load-more**
  pagination, sticky filters, and a clearable search.
- **VIN copy:** Click-to-copy VIN using a **stretched-link** row pattern, so copying doesn't trigger
  navigation.
- **Placeholder images:** `placehold.co` serves SVG (Next's optimizer rejects it), so images render
  **unoptimized** with a branded fallback tile — no broken images.
- **Runtime:** Home route is `force-dynamic` (request-time auction anchor); the Next dev-tools
  indicator is hidden.

<!-- Append new decisions below this line -->
