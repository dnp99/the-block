"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useToast } from "@/components/ui/Toaster";
import { BID_INCREMENT, minimumBid, placeBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { vehicleTitle } from "@/lib/format";
import { useFormat } from "@/hooks/useFormat";
import { useToastMessages } from "@/hooks/useToastMessages";

/*
  One-tap quick bid from the browse list — OPENLANE-style "⚡ +$100". Sits above
  the card (z-[2]) and stops propagation so it bids instead of navigating. Two-step
  confirm guards against accidental taps; reuses the shared bid logic.
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

  return (
    <button
      type="button"
      onClick={handle}
      aria-label={t("quickBidAria", { amount: fmt.currency(min), vehicle: vehicleTitle(vehicle) })}
      className={cn(
        "relative z-[2] inline-flex w-fit cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        confirming
          ? "bg-primary-700 text-white hover:bg-primary-800"
          : "bg-primary-600 text-white hover:bg-primary-700",
      )}
    >
      {confirming ? (
        t("confirmBid", { amount: fmt.currency(min) })
      ) : (
        <>
          <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z" />
          </svg>
          {t("plusIncrement", { amount: fmt.currency(BID_INCREMENT) })}
        </>
      )}
    </button>
  );
}
