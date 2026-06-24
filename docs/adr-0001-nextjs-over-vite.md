# ADR 0001 — Next.js (App Router) over Vite + separate backend

- **Status:** Accepted
- **Date:** 2026-06-23
- **Context:** The Block — buyer-side vehicle auction prototype (OPENLANE challenge)

## Context

The challenge README suggests "React + Vite" as one example stack, while explicitly
stating *"none of these are required — use any framework, language, or stack."*

Two product requirements drive the decision:

1. **AI features** (natural-language search, condition summary) call the Anthropic API.
   The `ANTHROPIC_API_KEY` must **never** reach the browser.
2. The repo must be **trivial to clone and run** — a graded criterion ("a repo we can
   clone and run by following your README").

A pure Vite app is frontend-only: it has no server runtime in which to hide an API key
or proxy a third-party call. Satisfying requirement (1) with Vite therefore forces a
**second service** (e.g. an Express server), which works against requirement (2).

## Decision

Build a **single Next.js (App Router) application**, deployed to **Vercel only**.

- React components + Tailwind v4 render the UI (same React we'd write under Vite).
- Two **Route Handlers** (`app/api/search`, `app/api/condition-summary`) run server-side
  and proxy Claude. The API key is read only there, via `process.env`, never shipped to
  the client.
- One repo, one `npm install && npm run dev`, one deploy.

## Consequences

**Positive**

- **API key stays server-side** — the browser only ever calls same-origin `/api/*` routes.
- **No CORS** — frontend and API share an origin.
- **One thing to run and deploy** — no second backend service, no Railway, no env wiring
  between two apps. Best possible clone-and-run story.
- **SSR/metadata, file-based routing, and `next/image`** come for free.

**Negative / trade-offs**

- Next.js is a heavier framework than Vite (more conventions, larger dependency tree).
  Accepted: the conventions are worth it for the server boundary we need.
- Slightly less "bare React" than a Vite SPA. Mitigated: it is still plain React 19 +
  Tailwind; nothing Next-specific leaks into component code beyond routing and the two
  API routes.

## Alternatives considered

| Option | Why not |
|--------|---------|
| **Vite SPA, call Claude from the browser** | Leaks the API key to the client. Unacceptable. |
| **Vite SPA + separate Express/Railway backend** | Satisfies key security but adds a second service, CORS config, and a second deploy — more to run and explain, weaker clone-and-run. (This was the original plan; we changed it.) |
| **Vite SPA, no live AI (mocked)** | Drops the headline differentiator for an AI-first role. |
| **Next.js, single app (chosen)** | Server boundary for the key, one deploy, no CORS. |

## Notes

This is purely an infrastructure choice. The product (React components, design tokens,
filter/bid logic) would be nearly identical under Vite — the difference is *where the
Claude calls run*, which is the whole point.
