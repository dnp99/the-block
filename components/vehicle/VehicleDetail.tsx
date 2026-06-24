import Link from "next/link";
import { AuctionPanel } from "@/components/vehicle/AuctionPanel";
import { BidBar } from "@/components/vehicle/BidBar";
import { ConditionSection } from "@/components/vehicle/ConditionSection";
import { DealerBlock } from "@/components/vehicle/DealerBlock";
import { SpecGrid } from "@/components/vehicle/SpecGrid";
import { VehicleGallery } from "@/components/vehicle/VehicleGallery";
import { VinCopy } from "@/components/vehicle/VinCopy";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { vehicleLocation, vehicleTitle } from "@/lib/format";

export function VehicleDetail({
  vehicle: v,
  anchorMs,
}: {
  vehicle: Vehicle;
  anchorMs: number;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-40 sm:px-6 lg:pb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-primary-600 transition hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to browse
      </Link>

      <header className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {vehicleTitle(v)} <span className="text-ink-muted">{v.trim}</span>
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
          <VinCopy vin={v.vin} />
          <span aria-hidden className="text-ink-subtle">
            ·
          </span>
          <span>{vehicleLocation(v)}</span>
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-5 lg:grid lg:grid-cols-[1fr_22rem] lg:items-start lg:gap-6">
        <div className="lg:col-start-1 lg:row-start-1">
          <VehicleGallery images={v.images} alt={vehicleTitle(v)} />
        </div>

        <aside className="hidden lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-20 lg:block">
          <AuctionPanel vehicle={v} anchorMs={anchorMs} />
        </aside>

        <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-2">
          <SpecGrid vehicle={v} />
          <ConditionSection vehicle={v} />
          <DealerBlock vehicle={v} />
        </div>
      </div>

      <BidBar vehicle={v} anchorMs={anchorMs} />
    </div>
  );
}
