"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toaster";
import { placeBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatCurrency } from "@/lib/format";
import { toastMessages } from "@/lib/toasts";

/*
  One-tap buy now from the browse list. Like QuickBid, but places a winning bid
  at the buy-now price. Two-step confirm; hidden once the current bid reaches it.
*/
export function QuickBuyNow({ vehicle }: { vehicle: Vehicle }) {
  const overrides = useBidOverrides();
  const override = overrides[vehicle.id];
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  const buyNow = vehicle.buy_now_price;
  const currentBid = override?.amount ?? vehicle.current_bid ?? vehicle.starting_bid;
  if (buyNow === null || buyNow <= currentBid) return null;

  const price = buyNow;

  function handle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      window.setTimeout(() => setConfirming(false), 3000);
      return;
    }
    try {
      placeBid(vehicle.id, price, vehicle.bid_count);
      toast(toastMessages.boughtNow(vehicle, price), "success");
    } catch {
      toast(toastMessages.buyNowFailed, "error");
    }
    setConfirming(false);
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={`Buy now for ${formatCurrency(price)}`}
      className={cn(
        "relative z-[2] w-fit cursor-pointer whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        confirming
          ? "border-primary-600 bg-primary-600 text-white hover:bg-primary-700"
          : "border-line text-ink hover:bg-neutral-100 dark:hover:bg-neutral-800",
      )}
    >
      {confirming ? `Confirm buy ${formatCurrency(price)}` : `Buy now ${formatCurrency(price)}`}
    </button>
  );
}
