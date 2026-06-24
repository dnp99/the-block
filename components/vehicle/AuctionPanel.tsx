"use client";

import { useEffect, useState } from "react";
import { BidForm } from "@/components/vehicle/BidForm";
import { BidHistoryButton } from "@/components/vehicle/BidHistoryButton";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { reserveStatusFor } from "@/components/vehicle/vehiclePills";
import {
  auctionCountdownLabel,
  auctionState,
  type AuctionPhase,
} from "@/lib/auction";
import { effectiveBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatCurrency } from "@/lib/format";

const PHASE: Record<AuctionPhase, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-success" },
  upcoming: { label: "Upcoming", dot: "bg-primary-500" },
  ended: { label: "Ended", dot: "bg-ink-subtle" },
};

export function AuctionPanel({
  vehicle: v,
  anchorMs,
}: {
  vehicle: Vehicle;
  anchorMs: number;
}) {
  const [now, setNow] = useState(anchorMs);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const overrides = useBidOverrides();
  const override = overrides[v.id];
  const { amount, count, isHighBidder } = effectiveBid(v, override);

  const state = auctionState(v.id, anchorMs, now);
  const phase = PHASE[state.phase];
  const ended = state.phase === "ended";
  const reserve = reserveStatusFor(amount, v.reserve_price);
  const hasBids = (override?.amount ?? v.current_bid) !== null;
  const urgent = state.phase === "live" && state.endMs - now <= 120_000;

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          <span aria-hidden className={cn("h-2 w-2 rounded-full", phase.dot)} />
          {phase.label}
        </span>
        <span
          className={cn(
            "text-sm tabular-nums",
            urgent
              ? "font-semibold text-error"
              : state.phase === "live"
                ? "font-medium text-success"
                : "text-ink-muted",
          )}
        >
          {auctionCountdownLabel(state, now)}
        </span>
      </div>

      <div>
        <p className="text-xs text-ink-subtle">{hasBids ? "Current bid" : "Starting bid"}</p>
        <p className="text-3xl font-bold tracking-tight text-ink">{formatCurrency(amount)}</p>
        <div className="mt-1 flex items-center gap-2">
          <BidHistoryButton
            vehicle={v}
            count={hasBids ? count : 0}
            override={override}
            nowMs={now}
          />
          <Pill tone={reserve.tone}>{reserve.label}</Pill>
        </div>
      </div>

      {isHighBidder && !ended && (
        <p className="flex items-center gap-1.5 rounded-xl bg-success-soft px-3 py-2 text-sm font-medium text-success dark:bg-success/15">
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          You’re the high bidder
        </p>
      )}

      {ended ? (
        <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-ink-muted dark:bg-neutral-800">
          This auction has ended.
        </p>
      ) : (
        <BidForm vehicle={v} />
      )}

      <dl className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
        <dt className="text-ink-subtle">Starting bid</dt>
        <dd className="text-right font-medium text-ink">{formatCurrency(v.starting_bid)}</dd>
      </dl>
    </Card>
  );
}
