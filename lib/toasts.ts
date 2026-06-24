/*
  Shared toast / inline-error copy. Centralized so the browse list (QuickBid /
  QuickBuyNow) and the VDP (BidForm) say exactly the same thing, and so success
  messages always name the vehicle, e.g. "Bid placed — $25,000 for 2025 Toyota
  Tacoma".
*/
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatCurrency, vehicleTitle } from "@/lib/format";

type TitleInput = Pick<Vehicle, "year" | "make" | "model">;

export const toastMessages = {
  bidPlaced: (v: TitleInput, amount: number) =>
    `Bid placed — ${formatCurrency(amount)} for ${vehicleTitle(v)}`,
  bidFailed: "Couldn’t place your bid, please try again",
  boughtNow: (v: TitleInput, amount: number) =>
    `Bought now — ${formatCurrency(amount)} for ${vehicleTitle(v)}`,
  buyNowFailed: "Couldn’t complete buy now, please try again",
  aiSearchUnavailable: "AI search unavailable — using basic search",
  aiSummaryUnavailable: "AI summary unavailable",
} as const;
