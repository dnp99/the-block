/*
  Auction phase derivation. The dataset's auction_start values are synthetic and
  all in the past, so (per the challenge) we normalize them relative to "now".

  Each vehicle gets a deterministic synthetic start time, derived from a hash of
  its id and anchored to a per-session reference (`anchorMs`, captured once at
  request time). Because the start is FIXED at the anchor, real time advancing
  past it moves a vehicle upcoming → live → ended and makes countdowns tick.

  Distribution at the anchor moment: ~40% live, ~40% upcoming, ~20% ended.
*/
import type { Vehicle } from "@/lib/contracts/vehicle";

export type AuctionPhase = "upcoming" | "live" | "ended";

const MIN = 60_000;
/** OPENLANE-style "always-on 45-minute auctions". */
export const LIVE_DURATION_MS = 45 * MIN;

/** FNV-1a hash → stable unsigned int per id. */
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fixed (anchor-relative) start time for a vehicle's auction. */
export function auctionStartMs(id: string, anchorMs: number): number {
  const h = hashId(id);
  const bucket = h % 100;
  if (bucket < 40) {
    // Live: started 0–44 min ago, so it's mid-window at the anchor.
    return anchorMs - (h % 45) * MIN;
  }
  if (bucket < 80) {
    // Upcoming: starts 1 min – 72 h ahead.
    return anchorMs + (1 + (h % (72 * 60))) * MIN;
  }
  // Ended: finished before the anchor.
  return anchorMs - (LIVE_DURATION_MS + (1 + (h % 2880)) * MIN);
}

export interface AuctionState {
  phase: AuctionPhase;
  startMs: number;
  endMs: number;
}

export function auctionState(
  id: string,
  anchorMs: number,
  nowMs: number,
): AuctionState {
  const startMs = auctionStartMs(id, anchorMs);
  const endMs = startMs + LIVE_DURATION_MS;
  const phase: AuctionPhase =
    nowMs < startMs ? "upcoming" : nowMs < endMs ? "live" : "ended";
  return { phase, startMs, endMs };
}

function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Short label: "Ends in 12m 4s" · "Starts in 3h 5m" · "Auction ended". */
export function auctionCountdownLabel(state: AuctionState, nowMs: number): string {
  if (state.phase === "ended") return "Auction ended";
  const target = state.phase === "live" ? state.endMs : state.startMs;
  const verb = state.phase === "live" ? "Ends in" : "Starts in";
  return `${verb} ${formatDuration(Math.max(0, target - nowMs))}`;
}

/** Convenience: state for a full vehicle. */
export function vehicleAuctionState(
  v: Pick<Vehicle, "id">,
  anchorMs: number,
  nowMs: number,
): AuctionState {
  return auctionState(v.id, anchorMs, nowMs);
}
