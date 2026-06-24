"use client";

import { useTranslations } from "next-intl";
import { BidForm } from "@/components/bidding/BidForm";
import { BidHistoryButton } from "@/components/bidding/BidHistoryButton";
import { auctionState } from "@/lib/auction";
import { bidDisplay } from "@/lib/bidDisplay";
import { useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { useAuctionClock } from "@/hooks/useAuctionClock";
import { useCountdownLabel } from "@/hooks/useCountdown";
import { useFormat } from "@/hooks/useFormat";
export function BidBar({ vehicle: v, auctionNowMs }: { vehicle: Vehicle; auctionNowMs: number }) {
  const { anchorMs, nowMs } = useAuctionClock(auctionNowMs);

  const tBid = useTranslations("bidding");
  const fmt = useFormat();
  const countdownLabel = useCountdownLabel();

  const overrides = useBidOverrides();
  const override = overrides[v.id];
  const state = auctionState(v.id, anchorMs, nowMs);
  const ended = state.phase === "ended";
  const upcoming = state.phase === "upcoming";
  const d = bidDisplay(v, state.phase, override);
  const urgent = state.phase === "live" && state.endMs - nowMs <= 120_000;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-sm backdrop-blur lg:hidden">
      <div className="mx-auto flex w-full min-w-0 max-w-xl flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
          <span className="text-sm text-ink-muted">
            {tBid(d.labelKey)}{" "}
            <span className="font-semibold text-ink">{fmt.currency(d.amount)}</span>
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
            {countdownLabel(state, nowMs)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-ink-muted">
          <BidHistoryButton
            vehicle={v}
            count={d.showCount ? d.count : 0}
            override={override}
            nowMs={nowMs}
          />
          {d.isHighBidder && state.phase === "live" && (
            <span className="font-medium text-success">
              · {tBid("highBidder")}
              {d.reserveMet && tBid("reserveMetSuffix")}
            </span>
          )}
        </div>

        {ended ? (
          <p className="text-sm text-ink-muted">{tBid("endedMessage")}</p>
        ) : upcoming ? (
          <p className="text-sm text-ink-muted">{tBid("opensWhenLive")}</p>
        ) : (
          <BidForm vehicle={v} />
        )}
      </div>
    </div>
  );
}
