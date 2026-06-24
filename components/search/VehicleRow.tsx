"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { QuickBid } from "@/components/search/QuickBid";
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
import { type AuctionState } from "@/lib/auction";
import { bidDisplay } from "@/lib/bidDisplay";
import { useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { capitalize, vehicleLocation, vehicleTitle } from "@/lib/format";
import { useCountdownBadge } from "@/lib/useCountdown";
import { useFormat } from "@/lib/useFormat";

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

  // The bottom meta + bid row is rendered twice: full-width below on mobile, and
  // inside the content column (right of the tall thumbnail) on desktop.
  const footer = () => (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0 text-xs text-ink-subtle">
        <p className="truncate">{vehicleLocation(v)}</p>
        <p className="truncate">{v.selling_dealership}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="leading-tight">
          <span className="text-[11px] text-ink-subtle">
            {tBid(d.labelKey)}
            {labelSep}
          </span>
          <span className="text-base font-bold text-ink sm:text-lg">{fmt.currency(d.amount)}</span>
        </p>
        {d.showCount ? (
          <div className="flex justify-end">
            <BidHistoryButton vehicle={v} count={d.count} override={override} nowMs={nowMs} />
          </div>
        ) : (
          state.phase !== "ended" && (
            <p className="text-[11px] text-ink-subtle">{tBid("noBidsYet")}</p>
          )
        )}
        {d.showActions && (
          <div className="mt-2 flex items-center justify-end gap-2">
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
    </div>
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

          {/* Desktop footer — pinned to the bottom of the content column */}
          <div className="mt-auto hidden border-t border-line pt-2.5 sm:block">{footer()}</div>
        </div>
      </div>

      {/* Mobile footer — full width below the thumbnail */}
      <div className="mt-3 border-t border-line pt-2.5 sm:hidden">{footer()}</div>
    </article>
  );
}
