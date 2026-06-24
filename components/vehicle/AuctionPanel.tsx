"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BidForm } from "@/components/vehicle/BidForm";
import { BidHistoryButton } from "@/components/vehicle/BidHistoryButton";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { reserveStatusFor } from "@/components/vehicle/vehiclePills";
import { auctionState, type AuctionPhase } from "@/lib/auction";
import { bidDisplay } from "@/lib/bidDisplay";
import { useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { useCountdownLabel } from "@/lib/useCountdown";
import { useFormat } from "@/lib/useFormat";

const PHASE_DOT: Record<AuctionPhase, string> = {
  live: "bg-success",
  upcoming: "bg-primary-500",
  ended: "bg-ink-subtle",
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

  const tBadge = useTranslations("badge");
  const tBid = useTranslations("bidding");
  const tPills = useTranslations("pills");
  const fmt = useFormat();
  const countdownLabel = useCountdownLabel();

  const overrides = useBidOverrides();
  const override = overrides[v.id];

  const state = auctionState(v.id, anchorMs, now);
  const ended = state.phase === "ended";
  const upcoming = state.phase === "upcoming";
  const d = bidDisplay(v, state.phase, override);
  const reserve = reserveStatusFor(d.amount, v.reserve_price);
  const urgent = state.phase === "live" && state.endMs - now <= 120_000;

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
          <span aria-hidden className={cn("h-2 w-2 rounded-full", PHASE_DOT[state.phase])} />
          {tBadge(state.phase)}
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
          {countdownLabel(state, now)}
        </span>
      </div>

      <div>
        <p className="text-xs text-ink-subtle">{tBid(d.labelKey)}</p>
        <p className="text-3xl font-bold tracking-tight text-ink">{fmt.currency(d.amount)}</p>
        <div className="mt-1 flex items-center gap-2">
          <BidHistoryButton
            vehicle={v}
            count={d.showCount ? d.count : 0}
            override={override}
            nowMs={now}
          />
          <Pill tone={reserve.tone}>
            {tPills(reserve.met ? "reserveMet" : "reserveNotMet")}
          </Pill>
        </div>
      </div>

      {d.isHighBidder && !ended && (
        <p className="flex items-center gap-1.5 rounded-xl bg-success-soft px-3 py-2 text-sm font-medium text-success dark:bg-success/15">
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {tBid("highBidder")}
          {reserve.met && tBid("reserveMetSuffix")}
        </p>
      )}

      {ended ? (
        <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-ink-muted dark:bg-neutral-800">
          {tBid("endedMessage")}
        </p>
      ) : upcoming ? (
        <p className="rounded-xl bg-neutral-100 px-3 py-2 text-sm text-ink-muted dark:bg-neutral-800">
          {tBid("opensWhenLive")}
        </p>
      ) : (
        <BidForm vehicle={v} />
      )}

      <dl className="grid grid-cols-2 gap-2 border-t border-line pt-3 text-sm">
        <dt className="text-ink-subtle">{tBid("starting")}</dt>
        <dd className="text-right font-medium text-ink">{fmt.currency(v.starting_bid)}</dd>
      </dl>
    </Card>
  );
}
