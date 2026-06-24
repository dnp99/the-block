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
  const upcoming = state.phase === "upcoming";
  const urgent = state.phase === "live" && state.endMs - nowMs <= 120_000;
  const condition = conditionPill(v.condition_grade);
  const damageCount = v.damage_notes.length;
  const reserve = reserveStatusFor(d.amount, v.reserve_price);
  const bidAmountLine = () => (
    <div className="flex items-center gap-2">
      <span className="text-base font-bold text-ink sm:text-lg">{fmt.currency(d.amount)}</span>
      {!upcoming && (
        <>
          <Sep />
          {d.showCount ? (
            <BidHistoryButton vehicle={v} count={d.count} override={override} nowMs={nowMs} />
          ) : (
            <span className="text-sm text-ink-subtle">{tBid("noBidsYet")}</span>
          )}
        </>
      )}
    </div>
  );
  const actionButtons = (desktop = false) => (
    <div
      className={cn(
        "flex shrink-0 justify-end gap-2",
        desktop ? "w-36 flex-col items-stretch" : "flex-row items-center",
      )}
    >
      {desktop ? (
        <>
          <QuickBid vehicle={v} className="w-full" />
          <Link
            href={`/vehicle/${v.id}`}
            className="inline-flex items-center justify-center rounded-xl bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
          >
            {tBid("placeABid")}
          </Link>
        </>
      ) : (
        <>
          <QuickBid vehicle={v} />
          <Link
            href={`/vehicle/${v.id}`}
            className="rounded-xl bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
          >
            {tBid("placeABid")}
          </Link>
        </>
      )}
    </div>
  );

  const sellerLocationRow = () => (
    <div className="flex items-start justify-between gap-3 text-xs text-ink-subtle">
      <p className="min-w-0 flex-1 truncate">{v.selling_dealership}</p>
      <p className="min-w-0 flex-1 truncate text-right">{vehicleLocation(v)}</p>
    </div>
  );

  const mobileBottomCluster = () => (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-lg font-bold text-ink">{fmt.currency(d.amount)}</span>
          {!upcoming &&
            (d.showCount ? (
              <BidHistoryButton vehicle={v} count={d.count} override={override} nowMs={nowMs} />
            ) : (
              <span className="text-sm text-ink-subtle">{tBid("noBidsYet")}</span>
            ))}
        </div>
        {d.showActions && actionButtons(true)}
      </div>
      <div className="border-t border-line pt-2">{sellerLocationRow()}</div>
    </>
  );

  return (
    <article
      className={cn(
        "rounded-2xl border border-line bg-surface p-3 shadow-sm transition hover:border-line-strong sm:p-4",
        ended && "opacity-80",
      )}
    >
      <div className="flex gap-3 sm:items-start sm:gap-5">
        <div className="group relative aspect-[4/3] w-28 shrink-0 self-start overflow-hidden rounded-xl bg-neutral-100 sm:h-44 sm:w-60 dark:bg-neutral-800">
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

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-h-44">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
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
                  {damageCount === 0
                    ? tPills("noDamage")
                    : tPills("disclosures", { count: damageCount })}
                </Pill>
                <Pill variant="outline" tone={reserve.tone}>
                  {tPills(reserve.met ? "reserveMet" : "reserveNotMet")}
                </Pill>
              </div>
            </div>

            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end sm:gap-2">
              {bidAmountLine()}
              {d.showActions && actionButtons(true)}
            </div>
          </div>

          <div className="hidden flex-col pt-2 sm:mt-auto sm:flex">
            <div className="border-t border-line pt-2">{sellerLocationRow()}</div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:hidden">{mobileBottomCluster()}</div>
    </article>
  );
}
