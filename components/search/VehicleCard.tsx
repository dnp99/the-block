import Image from "next/image";
import Link from "next/link";
import { Pill } from "@/components/ui/Pill";
import { conditionPill, titlePill } from "@/components/vehicle/vehiclePills";
import type { Vehicle } from "@/lib/contracts/vehicle";
import {
  effectivePrice,
  formatCurrency,
  formatKm,
  vehicleLocation,
  vehicleTitle,
} from "@/lib/format";

export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
  const condition = conditionPill(v.condition_grade);
  const title = titlePill(v.title_status);
  const hasBids = v.current_bid !== null;

  return (
    <Link
      href={`/vehicle/${v.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:border-line-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={v.images[0]}
          alt={vehicleTitle(v)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        <div className="absolute left-2 top-2 flex gap-1.5">
          <Pill tone={condition.tone}>{condition.label}</Pill>
          {v.title_status !== "clean" && <Pill tone={title.tone}>{title.label}</Pill>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">
            {vehicleTitle(v)}
          </h3>
          <p className="truncate text-xs text-ink-muted">
            {v.trim} · {v.body_style} · {formatKm(v.odometer_km)}
          </p>
          <p className="truncate text-xs text-ink-subtle">{vehicleLocation(v)}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-xs text-ink-subtle">
              {hasBids ? "Current bid" : "Starting bid"}
            </p>
            <p className="text-base font-semibold text-ink">
              {formatCurrency(effectivePrice(v))}
            </p>
          </div>
          <p className="text-xs text-ink-subtle">
            {hasBids
              ? `${v.bid_count} ${v.bid_count === 1 ? "bid" : "bids"}`
              : "No bids yet"}
          </p>
        </div>
      </div>
    </Link>
  );
}
