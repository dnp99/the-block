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

/** OPENLANE-style inventory row: image-on-top card (mobile) → side-by-side (sm+). */
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

  // Bid summary (price + bids + reserve + buy-now), shared by both breakpoints.
  const bidSummary = (
    <>
      <p className="text-xs text-ink-subtle">
        {hasBids ? "Current bid" : "Starting bid"}
      </p>
      <p className="text-lg font-semibold text-ink">{formatCurrency(effectivePrice(v))}</p>
      <p className="text-xs text-ink-subtle">
        {hasBids ? `${v.bid_count} ${v.bid_count === 1 ? "bid" : "bids"}` : "No bids yet"}
      </p>
      <Pill tone={reserve.tone}>{reserve.label}</Pill>
      {v.buy_now_price !== null && (
        <p className="text-xs font-medium text-primary-600">
          Buy now {formatCurrency(v.buy_now_price)}
        </p>
      )}
    </>
  );

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm transition hover:border-line-strong hover:shadow-md sm:flex-row sm:gap-4 sm:p-4">
      <Link
        href={`/vehicle/${v.id}`}
        aria-label={`View ${vehicleTitle(v)}`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      />

      <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:aspect-[4/3] sm:w-44 sm:self-start">
        <VehicleImage
          src={v.images[0]}
          alt={vehicleTitle(v)}
          sizes="(max-width: 640px) 100vw, 11rem"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2 py-0.5 text-xs font-semibold text-ink shadow-sm backdrop-blur">
            <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", badge.dot)} />
            {badge.label}
          </span>
          <span
            className={cn(
              "rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-medium tabular-nums shadow-sm backdrop-blur",
              urgent
                ? "text-error"
                : state.phase === "live"
                  ? "text-success"
                  : "text-ink-muted",
            )}
          >
            {auctionCountdownLabel(state, nowMs)}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
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
          {/* Bid summary on the right for tablet/desktop */}
          <div className="hidden shrink-0 flex-col items-end gap-0.5 text-right sm:flex">
            {bidSummary}
          </div>
        </div>

        <p className="truncate text-xs text-ink-muted sm:text-sm">
          {formatKm(v.odometer_km)} · {v.drivetrain} · {v.transmission} · {v.fuel_type}
        </p>
        <p className="truncate text-xs text-ink-subtle">
          {vehicleLocation(v)} · {v.selling_dealership}
        </p>

        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <Pill tone={condition.tone}>{condition.label}</Pill>
          {v.title_status !== "clean" && <Pill tone={title.tone}>{title.label}</Pill>}
          <Pill tone={damage.tone}>{damage.label}</Pill>
        </div>

        {/* Bid summary below the details on mobile */}
        <div className="mt-1 flex items-end justify-between gap-3 border-t border-line pt-2 sm:hidden">
          <div>
            <p className="text-xs text-ink-subtle">
              {hasBids ? "Current bid" : "Starting bid"}
            </p>
            <p className="text-lg font-semibold text-ink">
              {formatCurrency(effectivePrice(v))}
            </p>
          </div>
          <div className="flex flex-col items-end gap-0.5 text-right">
            <span className="text-xs text-ink-subtle">
              {hasBids ? `${v.bid_count} bids` : "No bids yet"}
            </span>
            <Pill tone={reserve.tone}>{reserve.label}</Pill>
            {v.buy_now_price !== null && (
              <p className="text-xs font-medium text-primary-600">
                Buy now {formatCurrency(v.buy_now_price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
