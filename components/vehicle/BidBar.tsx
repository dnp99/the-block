"use client";

import { useEffect, useState } from "react";
import { BidForm } from "@/components/vehicle/BidForm";
import { BidHistoryButton } from "@/components/vehicle/BidHistoryButton";
import { auctionCountdownLabel, auctionState } from "@/lib/auction";
import { bidDisplay } from "@/lib/bidDisplay";
import { useBidOverrides } from "@/lib/bids";
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
  const state = auctionState(v.id, anchorMs, now);
  const ended = state.phase === "ended";
  const upcoming = state.phase === "upcoming";
  const d = bidDisplay(v, state.phase, override);
  const urgent = state.phase === "live" && state.endMs - now <= 120_000;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-lg backdrop-blur lg:hidden">
      <div className="mx-auto flex w-full min-w-0 max-w-xl flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
          <span className="text-sm text-ink-muted">
            {d.label}{" "}
            <span className="font-semibold text-ink">{formatCurrency(d.amount)}</span>
          </span>
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
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

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
          <BidHistoryButton
            vehicle={v}
            count={d.showCount ? d.count : 0}
            override={override}
            nowMs={now}
          />
          {d.isHighBidder && state.phase === "live" && (
            <span className="font-medium text-success">
              · You’re the high bidder{d.reserveMet && " · Reserve met"}
            </span>
          )}
        </div>

        {ended ? (
          <p className="text-sm text-ink-muted">This auction has ended.</p>
        ) : upcoming ? (
          <p className="text-sm text-ink-muted">Bidding opens when the auction goes live.</p>
        ) : (
          <BidForm vehicle={v} />
        )}
      </div>
    </div>
  );
}
