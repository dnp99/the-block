import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { VinCopy } from "@/components/vehicle/VinCopy";
import {
  conditionPill,
  damagePill,
  reservePill,
  titlePill,
} from "@/components/vehicle/vehiclePills";
import { auctionCountdownLabel, type AuctionPhase, type AuctionState } from "@/lib/auction";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import {
  effectivePrice,
  formatCurrency,
  formatKm,
  vehicleLocation,
  vehicleTitle,
} from "@/lib/format";

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
  const condition = conditionPill(v.condition_grade);
  const title = titlePill(v.title_status);
  const damage = damagePill(v);
  const reserve = reservePill(v);
  const hasBids = v.current_bid !== null;
  const badge = PHASE_BADGE[state.phase];
  const urgent = state.phase === "live" && state.endMs - nowMs <= 120_000;

  return (
    <div className="group relative flex gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm transition hover:border-line-strong hover:shadow-md sm:gap-4 sm:p-4">
      <Link
        href={`/vehicle/${v.id}`}
        aria-label={`View ${vehicleTitle(v)}`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      />

      {/* Left column: thumbnail + auction countdown */}
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
          className={cn(
            "px-0.5 text-xs leading-snug tabular-nums",
            urgent
              ? "font-semibold text-error"
              : state.phase === "live"
                ? "font-medium text-success"
                : "text-ink-subtle",
          )}
        >
          {auctionCountdownLabel(state, nowMs)}
        </span>
      </div>

      {/* Right column: vehicle details + bid summary */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-ink">{vehicleTitle(v)}</h3>
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
            <p className="text-[11px] text-ink-subtle">
              {hasBids ? "Current bid" : "Starting bid"}
            </p>
            <p className="text-base font-semibold text-ink">
              {formatCurrency(effectivePrice(v))}
            </p>
            <p className="text-[11px] text-ink-subtle">
              {hasBids ? `${v.bid_count} bids` : "No bids yet"}
            </p>
            {v.buy_now_price !== null && (
              <p className="text-[11px] font-medium text-primary-600">
                Buy now {formatCurrency(v.buy_now_price)}
              </p>
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
