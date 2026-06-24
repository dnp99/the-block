import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { conditionPill, titlePill } from "@/components/vehicle/vehiclePills";
import type { Vehicle } from "@/lib/contracts/vehicle";
import {
  effectivePrice,
  formatCurrency,
  formatKm,
  vehicleLocation,
  vehicleTitle,
} from "@/lib/format";

/** OPENLANE-style inventory row: thumbnail · details + badges · right-aligned bid. */
export function VehicleRow({ vehicle: v }: { vehicle: Vehicle }) {
  const condition = conditionPill(v.condition_grade);
  const title = titlePill(v.title_status);
  const hasBids = v.current_bid !== null;

  const bidBlock = (
    <div className="text-right">
      <p className="text-xs text-ink-subtle">
        {hasBids ? "Current bid" : "Starting bid"}
      </p>
      <p className="text-lg font-semibold text-ink">
        {formatCurrency(effectivePrice(v))}
      </p>
      <p className="text-xs text-ink-subtle">
        {hasBids
          ? `${v.bid_count} ${v.bid_count === 1 ? "bid" : "bids"}`
          : "No bids yet"}
      </p>
    </div>
  );

  return (
    <Link
      href={`/vehicle/${v.id}`}
      className="group flex gap-3 rounded-2xl border border-line bg-surface p-3 shadow-sm transition hover:border-line-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:gap-4 sm:p-4"
    >
      <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:w-44">
        <VehicleImage
          src={v.images[0]}
          alt={vehicleTitle(v)}
          sizes="(max-width: 640px) 7rem, 11rem"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-ink">{vehicleTitle(v)}</h3>
            <p className="truncate text-xs text-ink-muted sm:text-sm">
              {v.trim} · {v.body_style}
            </p>
          </div>
          {/* Bid on the right for tablet/desktop */}
          <div className="hidden shrink-0 sm:block">{bidBlock}</div>
        </div>

        <p className="truncate text-xs text-ink-muted sm:text-sm">
          {formatKm(v.odometer_km)} · {v.drivetrain} · {v.transmission} · {v.fuel_type}
        </p>
        <p className="truncate text-xs text-ink-subtle">
          {vehicleLocation(v)} · {v.selling_dealership}
        </p>

        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <Pill tone={condition.tone}>{condition.label}</Pill>
          {v.title_status !== "clean" && (
            <Pill tone={title.tone}>{title.label}</Pill>
          )}
          <span className="font-mono text-[11px] text-ink-subtle">{v.vin}</span>
        </div>

        {/* Bid below the details on mobile */}
        <div className="mt-1 flex items-center justify-between border-t border-line pt-2 sm:hidden">
          <div>
            <span className="text-xs text-ink-subtle">
              {hasBids ? "Current bid " : "Starting bid "}
            </span>
            <span className="font-semibold text-ink">
              {formatCurrency(effectivePrice(v))}
            </span>
          </div>
          <span className="text-xs text-ink-subtle">
            {hasBids ? `${v.bid_count} bids` : "No bids yet"}
          </span>
        </div>
      </div>
    </Link>
  );
}
