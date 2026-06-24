/*
  Client-side bid persistence. Bids live in localStorage (versioned key,
  type-guarded on read). A small external store + useSyncExternalStore hook makes
  reads reactive across the page (and SSR-safe — server snapshot is empty).
*/
import { useMemo, useSyncExternalStore } from "react";
import {
  parseBidStore,
  type BidOverride,
  type BidStore,
} from "@/lib/contracts/bid";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { effectivePrice } from "@/lib/format";

const KEY = "openlane.bids.v1";
const EVENT = "openlane:bids";
export const BID_INCREMENT = 100;

function readRaw(): string {
  if (typeof window === "undefined") return "{}";
  try {
    return localStorage.getItem(KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

export function readBids(): BidStore {
  return parseBidStore(readRaw());
}

function writeBids(store: BidStore): void {
  localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(EVENT));
}

/** Record a bid for a vehicle, incrementing the bid count over its base. */
export function placeBid(id: string, amount: number, baseCount: number): BidOverride {
  const store = readBids();
  const count = (store[id]?.count ?? baseCount) + 1;
  const override: BidOverride = { amount, count, at: Date.now() };
  writeBids({ ...store, [id]: override });
  return override;
}

/** Minimum acceptable next bid: opening = starting bid; otherwise current + increment. */
export function minimumBid(
  v: Pick<Vehicle, "current_bid" | "starting_bid">,
  override?: BidOverride,
): number {
  const current = override?.amount ?? v.current_bid;
  return current == null ? v.starting_bid : current + BID_INCREMENT;
}

/** Effective bid state for display, merging any local override over the dataset. */
export function effectiveBid(v: Vehicle, override?: BidOverride) {
  return {
    amount: override?.amount ?? effectivePrice(v),
    count: override?.count ?? v.bid_count,
    isHighBidder: Boolean(override),
  };
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/** Reactive map of all bid overrides (re-renders when a bid is placed). */
export function useBidOverrides(): BidStore {
  const raw = useSyncExternalStore(subscribe, readRaw, () => "{}");
  return useMemo(() => parseBidStore(raw), [raw]);
}
