"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toaster";
import { minimumBid, placeBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatCurrency } from "@/lib/format";

/*
  One-tap quick bid from the browse list. Sits above the card's stretched link
  (z-[2]) and stops propagation, so it bids instead of navigating. Two-step
  confirm guards against accidental taps; reuses the shared bid logic.
*/
export function QuickBid({ vehicle }: { vehicle: Vehicle }) {
  const overrides = useBidOverrides();
  const override = overrides[vehicle.id];
  const min = minimumBid(vehicle, override);
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), 3000);
      return;
    }
    try {
      placeBid(vehicle.id, min, vehicle.bid_count);
      toast(`Bid placed — ${formatCurrency(min)}`, "success");
    } catch {
      toast("Couldn’t place your bid, please try again", "error");
    }
    setConfirming(false);
  }

  const label = confirming ? `Confirm ${formatCurrency(min)}` : `Bid ${formatCurrency(min)}`;

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={`Quick bid ${formatCurrency(min)} on ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
      className={cn(
        "relative z-[2] ml-auto mt-1.5 block w-fit cursor-pointer whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        confirming
          ? "border-primary-600 bg-primary-600 text-white hover:bg-primary-700"
          : "border-primary-600 text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/20",
      )}
    >
      {label}
    </button>
  );
}
