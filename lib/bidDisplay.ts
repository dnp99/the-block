import type { AuctionPhase } from "@/lib/auction";
import type { BidOverride } from "@/lib/contracts/bid";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { effectivePrice } from "@/lib/format";
export type BidLabelKey = "starting" | "current" | "sold" | "final" | "noBids";

export interface BidDisplay {
  label: string;
  labelKey: BidLabelKey;
  amount: number;
  count: number;
  showCount: boolean;
  showActions: boolean;
  isHighBidder: boolean;
  reserveMet: boolean;
}

export function bidDisplay(
  v: Vehicle,
  phase: AuctionPhase,
  override?: BidOverride,
): BidDisplay {
  if (phase === "upcoming") {
    return {
      label: "Starting bid",
      labelKey: "starting",
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
        labelKey: "noBids",
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
      labelKey: reserveMet ? "sold" : "final",
      amount,
      count,
      showCount: true,
      showActions: false,
      isHighBidder: Boolean(override),
      reserveMet,
    };
  }

  return {
    label: hasBids ? "Current bid" : "Starting bid",
    labelKey: hasBids ? "current" : "starting",
    amount,
    count: hasBids ? count : 0,
    showCount: hasBids,
    showActions: true,
    isHighBidder: Boolean(override),
    reserveMet,
  };
}
