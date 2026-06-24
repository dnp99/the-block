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
- A stable hash of the vehicle `id` assigns a synthetic start time relative to a **client-side
  "now" anchor** (`useAuctionClock`). The anchor seeds from a server timestamp (`auctionNowMs`) for
  SSR, then re-anchors to the viewer's real `Date.now()` on mount and stays frozen — so countdowns
  tick and a vehicle moves upcoming → live → ended as real time advances.
- Distribution at the anchor moment: ~40% live, ~40% upcoming, ~20% ended; upcoming/ended are
  spread across ~5 days each (a ~10-day calendar).
- Live auctions run a **45-minute window** (matching OPENLANE's "always-on 45-minute auctions").

**Why client-anchored (update 2026-06-24).** The anchor was originally the server timestamp alone.
On Vercel a cached/stale render left `auctionNowMs` older than the 45-min live window while the
client clock advanced to real time → every live auction was already in the past and the **Live tab
showed empty**. Anchoring to the client clock makes freshness independent of server/CDN caching.

**Consequences.**
- ✅ Realistic, populated Live / Upcoming / Ended tabs and live countdowns, with no real timestamps —
  reliably, regardless of cache staleness.
- ✅ Deterministic + hydration-safe: SSR uses the server seed (first render matches), then the client
  re-anchors and a 1s clock advances phases.
- ⚠️ Phases are synthetic, not real auction times — clearly a prototype normalization, documented
  here and in `lib/auction.ts`.

**Alternatives rejected.** Use the raw timestamps (everything shows as ended); random assignment
(non-deterministic — breaks SSR/hydration and is unstable across renders).

## ADR 0003 — Synthesized bid history (no per-bid data in the dataset)

- **Status:** Accepted · **Date:** 2026-06-23

**Context.** The dataset has only `current_bid` and `bid_count` — no list of individual bids,
bidders, or timestamps. A "bid history" (clicking the bid count) therefore can't come from the
data; it has to be constructed.

**Decision.** Deterministically reconstruct a plausible ascending history from `starting_bid` →
`current_bid` over `bid_count` steps (hashed from the vehicle id, stable across renders), with
**masked bidder IDs** ("Bidder ••4821") and relative timestamps. The buyer's **real** local bids
are overlaid on top labeled **"You"**. The modal carries a note that prior bids are reconstructed
and identities masked.

**Consequences.**
- ✅ A complete-feeling bid history with no real per-bid data; consistent with ADR 0002.
- ✅ The user's own bids remain genuinely real (from localStorage).
- ⚠️ Prior bids are fabricated — clearly labeled in the UI and here. We only store the buyer's
  latest bid, so multiple own-bids collapse to one "You" entry.

**Alternatives rejected.** Show only the user's local bids (usually empty); random history
(non-deterministic, unstable across renders).

## ADR 0004 — Bilingual EN/FR with next-intl, cookie locale (no URL routing)

- **Status:** Accepted · **Date:** 2026-06-24

**Context.** OPENLANE is a Canadian marketplace and Canada is officially bilingual, so EN/FR
is both on-brand and a relevant signal for an AI-first SWE role. The data is already Canadian
(`en-CA` formatting, Ontario/BC). We want a credible, *demonstrably working* bilingual UI
without half-translated screens.

**Decision.** Use **next-intl** with a **cookie-based locale and no URL routing** (for v1):
- The active locale comes from a `tb-locale` cookie, resolved **server-side** in
  `i18n/request.ts`, so the correct language is in the initial SSR HTML (**no flash**) and
  `<html lang>` is set correctly. A header **EN/FR toggle** writes the cookie + `router.refresh()`.
- EN/FR **JSON catalogs** live in `messages/`, namespaced (`browse`, `bidding`, `pills`,
  `auction`, `toasts`, …).
- **FR-CA vs en-CA Intl formatting** for currency/numbers (**`$25,000` ↔ `25 000 $`**) via a
  `useFormat` hook.
- **Pure logic stays framework-free and testable**: shared helpers expose translation *keys*
  (`bidDisplay.labelKey`, `countdownParts` + `useCountdownLabel`) so the wording lives in the
  catalogs while the logic stays unit-tested.

**Scope (v1).** Bilingual: the browse experience, global states (error/not-found), toasts, and
the **full bidding UI** (cards + VDP panel/bar/form), with FR-CA formatting throughout.

**Deferred (phase 2).** The VDP *descriptive* content (spec field labels, condition &
disclosures section, gallery, dealer block), the **AI-generated condition summary text** (stays
English — locale-aware Claude prompts noted as future), `formatAgo` in the history modal, and
dataset **enum values** (make / body / drivetrain / fuel — these are data, not UI copy).

**Consequences.**
- ✅ No-flash, SSR-resolved locale; `<html lang>` correct for a11y/SEO.
- ✅ i18n is a thin presentation layer — pure logic (`countdownParts`, `bidDisplay`) stays testable.
- ⚠️ No `/en` `/fr` URL routing in v1 (cookie only); switching needs a server refresh. Documented
  as future work.
- ⚠️ AI outputs and the VDP descriptive labels remain English (phase 2).

**Alternatives rejected.** A hand-rolled `t()` (reinvents plurals / ICU / locale formatting);
URL-routed locales (SEO-correct but more work across every route — deferred); translating dataset
enums (they're data values, not UI copy).

## ADR 0005 — Persist browse filters in sessionStorage (not URL query params)

- **Status:** Accepted · **Date:** 2026-06-24

**Context.** All browse state (tab, search query + AI filters, manual filters, slider ranges,
sort) lives in `SearchView` local state. Opening a vehicle navigates to `/vehicle/[id]`, which
unmounts the browse view; the VDP "Back to browse" is a `<Link href="/">`, so returning remounts
`SearchView` fresh and **loses the user's filters**. We want filters to survive the
VDP round-trip and a reload, but a click on the header **logo** should give a clean slate.

**Decision.** Persist a `BrowseState` snapshot to **`sessionStorage`** (`lib/browseState.ts`):
- `SearchView` **saves** on every state change and **restores once on mount**.
- AI chips restore via a `restoreAi` seam on `useAiSearchFilters` that **seeds the request cache**,
  so restored filters re-apply with **no refetch** and chip removals are preserved.
- The header logo is a client `BrandLink` that **clears** the store on click — so the back button
  and reloads restore filters, while the logo resets to a fresh browse.

**Consequences.**
- ✅ Filters survive VDP → back and reloads within the tab; logo = explicit reset; cleared on tab close.
- ✅ Self-contained — no routing changes, no churn to the data-fetching layer; one client store.
- ⚠️ State is **not in the URL**, so a filtered view isn't shareable or bookmarkable, and the
  browser Back/Forward stack doesn't step through filter changes.

**Alternatives rejected (with more time → preferred).** Encode filters in **URL query params**
(`?tab=live&make=Toyota&price_max=50000&q=…`). This is the better long-term design: shareable,
bookmarkable, SEO-friendly, and Back/Forward navigates filter history natively (with a debounced
`router.replace` to avoid history spam). We deferred it because it's a larger refactor —
two-way state↔URL sync, validation/parsing of every param, and changing the VDP back link to
preserve the query string (or use `router.back()`), all of which need their own tests. For v1,
`sessionStorage` delivers the required UX (survive round-trip + reload, logo resets) with far less
surface area. Also rejected: `localStorage` (persists across tabs/sessions — too sticky; users
would return days later to stale filters).

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
