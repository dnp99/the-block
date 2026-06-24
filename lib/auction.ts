import type { Vehicle } from "@/lib/contracts/vehicle";

export type AuctionPhase = "upcoming" | "live" | "ended";

const MIN = 60_000;
export const LIVE_DURATION_MS = 45 * MIN;
const SPREAD_MIN = 5 * 24 * 60; // upcoming/ended spread ~5 days each → a ~10-day calendar
function hashId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function auctionStartMs(id: string, auctionNowMs: number): number {
  const h = hashId(id);
  const bucket = h % 100;
  if (bucket < 40) {
    return auctionNowMs - (h % 45) * MIN;
  }
  if (bucket < 80) {
    return auctionNowMs + (1 + (h % SPREAD_MIN)) * MIN;
  }

  return auctionNowMs - (LIVE_DURATION_MS + (1 + (h % SPREAD_MIN)) * MIN);
}

export interface AuctionState {
  phase: AuctionPhase;
  startMs: number;
  endMs: number;
}

export function auctionState(
  id: string,
  auctionNowMs: number,
  nowMs: number,
): AuctionState {
  const startMs = auctionStartMs(id, auctionNowMs);
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
export function auctionCountdownLabel(state: AuctionState, nowMs: number): string {
  if (state.phase === "ended") return "Auction ended";
  const target = state.phase === "live" ? state.endMs : state.startMs;
  const verb = state.phase === "live" ? "Ends in" : "Starts in";
  return `${verb} ${formatDuration(Math.max(0, target - nowMs))}`;
}

export type CountdownParts =
  | { phase: "ended" }
  | { phase: "live" | "upcoming"; d: number; h: number; m: number; s: number };
export function countdownParts(state: AuctionState, nowMs: number): CountdownParts {
  if (state.phase === "ended") return { phase: "ended" };
  const target = state.phase === "live" ? state.endMs : state.startMs;
  const total = Math.floor(Math.max(0, target - nowMs) / 1000);
  return {
    phase: state.phase,
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}
export function vehicleAuctionState(
  v: Pick<Vehicle, "id">,
  auctionNowMs: number,
  nowMs: number,
): AuctionState {
  return auctionState(v.id, auctionNowMs, nowMs);
}
