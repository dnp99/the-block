"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { QuickBid } from "@/components/bidding/QuickBid";
import { Pill } from "@/components/shared/Pill";
import { BidHistoryButton } from "@/components/bidding/BidHistoryButton";
import { VehicleImage } from "@/components/shared/VehicleImage";
import { VinCopy } from "@/components/shared/VinCopy";
import {
  conditionPill,
  damagePill,
  reserveStatusFor,
  titlePill,
} from "@/lib/vehiclePills";
import { type AuctionState } from "@/lib/auction";
import { bidDisplay } from "@/lib/bidDisplay";
import { useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { capitalize, vehicleLocation, vehicleTitle } from "@/lib/format";
import { useCountdownBadge } from "@/hooks/useCountdown";
import { useFormat } from "@/hooks/useFormat";

const Sep = () => (
  <span aria-hidden className="text-ink-subtle">
    |
  </span>
);

/** OPENLANE-style inventory row: large thumbnail + details + bottom meta/bid row. */
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
  const tBid = useTranslations("bidding");
  const tPills = useTranslations("pills");
  const fmt = useFormat();
  const badgeLabel = useCountdownBadge()(state, nowMs);

  const ended = state.phase === "ended";
  const urgent = state.phase === "live" && state.endMs - nowMs <= 120_000;
  const condition = conditionPill(v.condition_grade);
  const damageCount = v.damage_notes.length;
  const reserve = reserveStatusFor(d.amount, v.reserve_price);
  // French puts a space before the colon.
  const labelSep = fmt.locale.startsWith("fr") ? " : " : ": ";

  // Bid summary (price + bid count) — sits ABOVE the separator with the vehicle
  // details. Stacked on desktop; on one line on mobile.
  const bidSummary = () => (
    <div className="flex flex-wrap items-baseline justify-end gap-x-2 sm:flex-col sm:items-end sm:gap-x-0">
      <p className="leading-tight">
        <span className="text-[11px] text-ink-subtle">
          {tBid(d.labelKey)}
          {labelSep}
        </span>
        <span className="text-base font-bold text-ink sm:text-lg">{fmt.currency(d.amount)}</span>
      </p>
      {d.showCount ? (
        <BidHistoryButton vehicle={v} count={d.count} override={override} nowMs={nowMs} />
      ) : (
        state.phase !== "ended" && (
          <span className="text-[11px] text-ink-subtle">{tBid("noBidsYet")}</span>
        )
      )}
    </div>
  );

  // Below the separator: location/dealership (left) + actions (right, active only).
  const bottomRow = () => (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0 text-xs text-ink-subtle">
        <p className="truncate">{vehicleLocation(v)}</p>
        <p className="truncate">{v.selling_dealership}</p>
      </div>
      {d.showActions && (
        <div className="flex shrink-0 items-center justify-end gap-2">
          <Link
            href={`/vehicle/${v.id}`}
            className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
          >
            {tBid("placeABid")}
          </Link>
          <QuickBid vehicle={v} />
        </div>
      )}
    </div>
  );

  // Bid + separator + bottom row, grouped so they pin to the bottom on desktop.
  const bidCluster = () => (
    <>
      {bidSummary()}
      <div className="border-t border-line pt-2.5">{bottomRow()}</div>
    </>
  );

  return (
    <article
      className={cn(
        "rounded-2xl border border-line bg-surface p-3 shadow-sm transition hover:border-line-strong hover:shadow-md sm:p-4",
        ended && "opacity-80",
      )}
    >
      <div className="flex gap-3 sm:items-stretch sm:gap-5">
        {/* Thumbnail — small on mobile, tall on desktop, with status badge */}
        <div className="group relative aspect-[4/3] w-28 shrink-0 self-start overflow-hidden rounded-xl bg-neutral-100 sm:aspect-auto sm:min-h-44 sm:w-60 sm:self-stretch dark:bg-neutral-800">
          <VehicleImage
            src={v.images[0]}
            alt={vehicleTitle(v)}
            sizes="(max-width: 640px) 7rem, 15rem"
          />
          <span
            className={cn(
              "absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-semibold shadow-sm",
              ended
                ? "bg-ink text-white"
                : urgent
                  ? "bg-surface text-error"
                  : "bg-surface/95 text-ink backdrop-blur",
            )}
          >
            {badgeLabel}
          </span>
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="truncate text-base leading-tight sm:text-lg">
            <Link
              href={`/vehicle/${v.id}`}
              className="rounded text-ink transition hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <span className="font-medium text-ink-muted">
                {v.year} {v.make}{" "}
              </span>
              <span className="font-bold">{v.model}</span>
            </Link>
          </h3>

          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-ink-muted sm:text-sm">
            <span>{fmt.km(v.odometer_km)}</span>
            <Sep />
            <span>{v.drivetrain}</span>
            <Sep />
            <span className="truncate">{v.trim}</span>
            <span className="hidden items-center gap-x-1.5 sm:inline-flex">
              <Sep />
              <VinCopy vin={v.vin} className="text-xs" />
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Pill variant="outline" tone={condition.tone}>
              {condition.label}
            </Pill>
            {v.title_status !== "clean" && (
              <Pill variant="outline" tone={titlePill(v.title_status).tone}>
                {tPills(`title${capitalize(v.title_status)}`)}
              </Pill>
            )}
            <Pill variant="outline" tone={damagePill(v).tone}>
              {damageCount === 0 ? tPills("noDamage") : tPills("disclosures", { count: damageCount })}
            </Pill>
            <Pill variant="outline" tone={reserve.tone}>
              {tPills(reserve.met ? "reserveMet" : "reserveNotMet")}
            </Pill>
          </div>

          {/* Desktop bid + actions — pinned to the bottom of the content column */}
          <div className="mt-auto hidden flex-col gap-2 pt-1 sm:flex">{bidCluster()}</div>
        </div>
      </div>

      {/* Mobile bid + actions — full width below the thumbnail */}
      <div className="mt-3 flex flex-col gap-2 sm:hidden">{bidCluster()}</div>
    </article>
  );
}
