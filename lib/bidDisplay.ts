/*
  Phase-aware bid presentation. The dataset's `current_bid` / `bid_count` are only
  meaningful while an auction is LIVE: an UPCOMING lot can't have bids yet (its
  start time was normalized — see ADR 0002 — so dataset bids would be "bids before
  the auction opened"), and an ENDED lot should read as an outcome (sold / no sale),
  not a live "current bid". Centralized here so the browse row and the VDP panel
  present identical, phase-correct states.
*/
import type { AuctionPhase } from "@/lib/auction";
import type { BidOverride } from "@/lib/contracts/bid";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { effectivePrice } from "@/lib/format";

export interface BidDisplay {
  /** Label above the amount, e.g. "Current bid" · "Starting bid" · "Sold for". */
  label: string;
  /** Dollar figure to show. */
  amount: number;
  /** Number of bids (0 when none or not applicable). */
  count: number;
  /** Show the (clickable) bid count / history. */
  showCount: boolean;
  /** Show bid / buy-now actions — live only. */
  showActions: boolean;
  /** The viewer holds the current high bid. */
  isHighBidder: boolean;
  /** The shown amount has cleared the reserve. */
  reserveMet: boolean;
}

export function bidDisplay(
  v: Vehicle,
  phase: AuctionPhase,
  override?: BidOverride,
): BidDisplay {
  // Pre-auction: bidding hasn't opened — show only the opening price.
  if (phase === "upcoming") {
    return {
      label: "Starting bid",
      amount: v.starting_bid,
      count: 0,
      showCount: false,
      showActions: false,
      isHighBidder: false,
      reserveMet: false,
    };
  }

  const hasBids = Boolean(override) || v.current_bid !== null;
  const amount = override?.amount ?? effectivePrice(v);
  const count = override?.count ?? v.bid_count;
  const reserveMet = amount >= v.reserve_price;

  if (phase === "ended") {
    if (!hasBids) {
      return {
        label: "No bids",
        amount: v.starting_bid,
        count: 0,
        showCount: false,
        showActions: false,
        isHighBidder: false,
        reserveMet: false,
      };
    }
    return {
      label: reserveMet ? "Sold for" : "Final bid",
      amount,
      count,
      showCount: true,
      showActions: false,
      isHighBidder: Boolean(override),
      reserveMet,
    };
  }

  // live
  return {
    label: hasBids ? "Current bid" : "Starting bid",
    amount,
    count: hasBids ? count : 0,
    showCount: hasBids,
    showActions: true,
    isHighBidder: Boolean(override),
    reserveMet,
  };
}
