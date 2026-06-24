"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { reservePill } from "@/components/vehicle/vehiclePills";
import {
  auctionCountdownLabel,
  auctionState,
  type AuctionPhase,
} from "@/lib/auction";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { effectivePrice, formatCurrency } from "@/lib/format";

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

  const state = auctionState(v.id, anchorMs, now);
  const phase = PHASE[state.phase];
  const reserve = reservePill(v);
  const hasBids = v.current_bid !== null;
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
        <p className="text-xs text-ink-subtle">
          {hasBids ? "Current bid" : "Starting bid"}
        </p>
        <p className="text-3xl font-bold tracking-tight text-ink">
          {formatCurrency(effectivePrice(v))}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm text-ink-muted">
            {hasBids
              ? `${v.bid_count} ${v.bid_count === 1 ? "bid" : "bids"}`
              : "No bids yet"}
          </span>
          <Pill tone={reserve.tone}>{reserve.label}</Pill>
        </div>
      </div>

      {v.buy_now_price !== null && (
        <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-3 dark:border-primary-900/50 dark:bg-primary-900/20">
          <p className="text-xs text-ink-subtle">Buy it now</p>
          <p className="text-lg font-semibold text-primary-700 dark:text-primary-300">
            {formatCurrency(v.buy_now_price)}
          </p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
        <dt className="text-ink-subtle">Starting bid</dt>
        <dd className="text-right font-medium text-ink">{formatCurrency(v.starting_bid)}</dd>
        <dt className="text-ink-subtle">Reserve</dt>
        <dd className="text-right font-medium text-ink">Not disclosed</dd>
      </dl>

      <p className="text-xs text-ink-subtle">
        Bidding is enabled in the next build step.
      </p>
    </Card>
  );
}
