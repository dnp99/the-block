"use client";

import Link from "next/link";
import { QuickBid } from "@/components/search/QuickBid";
import { QuickBuyNow } from "@/components/search/QuickBuyNow";
import { Pill } from "@/components/ui/Pill";
import { BidHistoryButton } from "@/components/vehicle/BidHistoryButton";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { VinCopy } from "@/components/vehicle/VinCopy";
import {
  conditionPill,
  damagePill,
  reserveStatusFor,
  titlePill,
} from "@/components/vehicle/vehiclePills";
import { auctionCountdownLabel, type AuctionPhase, type AuctionState } from "@/lib/auction";
import { bidDisplay } from "@/lib/bidDisplay";
import { useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatCurrency, formatKm, vehicleLocation, vehicleTitle } from "@/lib/format";

const PHASE_BADGE: Record<AuctionPhase, { label: string; dot: string }> = {
  live: { label: "Live", dot: "bg-success" },
  upcoming: { label: "Upcoming", dot: "bg-primary-500" },
  ended: { label: "Ended", dot: "bg-ink-subtle" },
};

/** Compact inventory row: thumbnail + auction status (left) · details · bid (right). */
export function VehicleRow({
  vehicle: v,
  state,
  nowMs,
}: {
  vehicle: Vehicle;
  state: AuctionState;
  nowMs: number;
}) {
  const override = useBidOverrides()[v.id];
  const d = bidDisplay(v, state.phase, override);
  const condition = conditionPill(v.condition_grade);
  const title = titlePill(v.title_status);
  const damage = damagePill(v);
  const reserve = reserveStatusFor(d.amount, v.reserve_price);
  const badge = PHASE_BADGE[state.phase];
  const urgent = state.phase === "live" && state.endMs - nowMs <= 120_000;
  const countdown = auctionCountdownLabel(state, nowMs);
  const countdownColor = urgent
    ? "font-semibold text-error"
    : state.phase === "live"
      ? "font-medium text-success"
      : "text-ink-subtle";

  return (
    <div className="group flex gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm transition hover:border-line-strong hover:shadow-md sm:gap-4 sm:p-4">
      {/* Left column: thumbnail + (mobile only) auction countdown */}
      <div className="flex w-24 shrink-0 flex-col gap-1.5 self-start sm:w-40">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
          <VehicleImage
            src={v.images[0]}
            alt={vehicleTitle(v)}
            sizes="(max-width: 640px) 6rem, 10rem"
          />
          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-surface/95 px-1.5 py-0.5 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
            {badge.label}
          </span>
        </div>
        <span
          className={cn("px-0.5 text-xs leading-snug tabular-nums sm:hidden", countdownColor)}
        >
          {countdown}
        </span>
      </div>

      {/* Right column: vehicle details + bid summary */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">
              <Link
                href={`/vehicle/${v.id}`}
                className="rounded text-ink transition hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                {vehicleTitle(v)}
              </Link>
            </h3>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-ink-muted sm:text-sm">
              <span>
                {v.trim} · {v.body_style}
              </span>
              <span aria-hidden className="text-ink-subtle">
                ·
              </span>
              <VinCopy vin={v.vin} className="text-xs" />
            </div>
          </div>
          <div className="shrink-0 text-right">
            {/* Desktop: countdown sits with the bid info (mobile shows it under the thumbnail) */}
            <p className={cn("hidden text-[11px] leading-tight tabular-nums sm:block", countdownColor)}>
              {countdown}
            </p>
            <p className="text-[11px] text-ink-subtle">{d.label}</p>
            <p className="text-base font-semibold text-ink">{formatCurrency(d.amount)}</p>
            {d.showCount ? (
              <div className="mt-0.5 hidden justify-end text-xs sm:flex">
                <BidHistoryButton vehicle={v} count={d.count} override={override} nowMs={nowMs} />
              </div>
            ) : (
              state.phase !== "ended" && (
                <p className="hidden text-[11px] text-ink-subtle sm:block">No bids yet</p>
              )
            )}
            {d.showActions && (
              <div className="mt-1.5 flex flex-col items-end gap-1.5 sm:flex-row sm:justify-end">
                <QuickBid vehicle={v} />
                <QuickBuyNow vehicle={v} />
              </div>
            )}
          </div>
        </div>

        <p className="truncate text-xs text-ink-muted">
          {formatKm(v.odometer_km)} · {v.drivetrain} · {v.transmission} · {v.fuel_type}
        </p>
        <p className="hidden truncate text-xs text-ink-subtle sm:block">
          {vehicleLocation(v)} · {v.selling_dealership}
        </p>

        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Pill tone={condition.tone}>{condition.label}</Pill>
          {v.title_status !== "clean" && <Pill tone={title.tone}>{title.label}</Pill>}
          <Pill tone={damage.tone}>{damage.label}</Pill>
          <Pill tone={reserve.tone}>{reserve.label}</Pill>
        </div>
      </div>
    </div>
  );
}
