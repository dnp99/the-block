"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useToast } from "@/components/ui/Toaster";
import { minimumBid, placeBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { vehicleTitle } from "@/lib/format";
import { useFormat } from "@/lib/useFormat";
import { useToastMessages } from "@/lib/useToastMessages";

/*
  One-tap quick bid from the browse list. Sits above the card (z-[2]) and stops
  propagation so it bids instead of navigating. Two-step confirm guards against
  accidental taps; reuses the shared bid logic.
*/
export function QuickBid({ vehicle }: { vehicle: Vehicle }) {
  const overrides = useBidOverrides();
  const override = overrides[vehicle.id];
  const min = minimumBid(vehicle, override);
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("bidding");
  const fmt = useFormat();
  const tm = useToastMessages();
  const amount = fmt.currency(min);

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
      toast(tm.bidPlaced(vehicle, min), "success");
    } catch {
      toast(tm.bidFailed, "error");
    }
    setConfirming(false);
  }

  const label = confirming ? t("confirmBid", { amount }) : t("bid", { amount });

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={t("quickBidAria", { amount, vehicle: vehicleTitle(vehicle) })}
      className={cn(
        "focus-visible:ring-primary-500 relative z-[2] w-fit cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition focus-visible:ring-2 focus-visible:outline-none",
        confirming
          ? "border-primary-600 bg-primary-600 hover:bg-primary-700 text-white"
          : "border-primary-600 text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900/20",
      )}
    >
      {label}
    </button>
  );
}
