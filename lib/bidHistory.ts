/*
  Synthesized bid history. The dataset has no per-bid history (only current_bid +
  bid_count), so we deterministically reconstruct a plausible ascending history
  from starting_bid → current_bid over bid_count steps (hashed from the vehicle
  id, so it's stable across renders). The buyer's own bids (from localStorage) are
  overlaid on top as "You". Prototype-only — see DECISIONS.md ADR 0003.
*/
import type { BidOverride } from "@/lib/contracts/bid";
import type { Vehicle } from "@/lib/contracts/vehicle";

export interface BidEntry {
  amount: number;
  bidder: string;
  secondsAgo: number;
  isYou: boolean;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round100 = (n: number) => Math.round(n / 100) * 100;

export function buildBidHistory(
  v: Vehicle,
  override: BidOverride | undefined,
  nowMs: number,
): BidEntry[] {
  const effectiveCount = override?.count ?? v.bid_count;
  if (effectiveCount <= 0) return [];

  const hasUser = Boolean(override);
  const userAgo = override ? Math.max(0, Math.round((nowMs - override.at) / 1000)) : 0;
  const synthCount = effectiveCount - (hasUser ? 1 : 0);
  const synthHigh = v.current_bid ?? v.starting_bid; // prior (pre-user) high
  const start = v.starting_bid;

  const entries: BidEntry[] = [];

  if (override) {
    entries.push({
      amount: override.amount,
      bidder: "You",
      secondsAgo: userAgo,
      isYou: true,
    });
  }

  // Synthetic prior bids: newest (index 0) ≈ synthHigh, oldest ≈ start.
  const amounts: number[] = [];
  for (let i = 0; i < synthCount; i++) {
    const t = synthCount <= 1 ? 1 : (synthCount - 1 - i) / (synthCount - 1);
    amounts.push(round100(start + (synthHigh - start) * t));
  }
  // Enforce strictly decreasing from newest down.
  for (let i = 1; i < amounts.length; i++) {
    if (amounts[i] >= amounts[i - 1]) amounts[i] = amounts[i - 1] - 100;
  }

  for (let i = 0; i < synthCount; i++) {
    const h = hash(`${v.id}:${i}`);
    entries.push({
      amount: amounts[i],
      bidder: `Bidder ••${1000 + (h % 9000)}`,
      // Prior bids are older than the user's; spaced deterministically.
      secondsAgo: userAgo + 90 + i * 150 + (h % 60),
      isYou: false,
    });
  }

  return entries;
}

export function formatAgo(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
