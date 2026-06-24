"use client";

import { useEffect, useState } from "react";
import { BidForm } from "@/components/vehicle/BidForm";
import { BidHistoryButton } from "@/components/vehicle/BidHistoryButton";
import { reserveStatusFor } from "@/components/vehicle/vehiclePills";
import { auctionCountdownLabel, auctionState } from "@/lib/auction";
import { effectiveBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatCurrency } from "@/lib/format";

/** Sticky bottom bid bar for small screens (the desktop bid UI is AuctionPanel). */
export function BidBar({ vehicle: v, anchorMs }: { vehicle: Vehicle; anchorMs: number }) {
  const [now, setNow] = useState(anchorMs);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const overrides = useBidOverrides();
  const override = overrides[v.id];
  const { amount, count, isHighBidder } = effectiveBid(v, override);
  const hasBids = (override?.amount ?? v.current_bid) !== null;
  const reserveMet = reserveStatusFor(amount, v.reserve_price).met;
  const state = auctionState(v.id, anchorMs, now);
  const ended = state.phase === "ended";
  const urgent = state.phase === "live" && state.endMs - now <= 120_000;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-lg backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-ink-muted">
            Current bid{" "}
            <span className="font-semibold text-ink">{formatCurrency(amount)}</span>
            <span aria-hidden className="text-ink-subtle">·</span>
            <BidHistoryButton
              vehicle={v}
              count={hasBids ? count : 0}
              override={override}
              nowMs={now}
            />
          </span>
          <span
            className={cn(
              "text-xs tabular-nums",
              urgent
                ? "font-semibold text-error"
                : state.phase === "live"
                  ? "font-medium text-success"
                  : "text-ink-subtle",
            )}
          >
            {auctionCountdownLabel(state, now)}
          </span>
        </div>
        {ended ? (
          <p className="py-1 text-sm text-ink-muted">This auction has ended.</p>
        ) : (
          <>
            {isHighBidder && (
              <p className="text-xs font-medium text-success">
                You’re the high bidder{reserveMet && " — this vehicle will sell"}
              </p>
            )}
            <BidForm vehicle={v} />
          </>
        )}
      </div>
    </div>
  );
}
