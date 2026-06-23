import { VehicleCard } from "@/components/search/VehicleCard";
import type { Vehicle } from "@/lib/contracts/vehicle";

export function VehicleGrid({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink">No vehicles match your search</p>
        <p className="mt-1 text-sm text-ink-muted">
          Try removing a filter or broadening your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
      {vehicles.map((v) => (
        <VehicleCard key={v.id} vehicle={v} />
      ))}
    </div>
  );
}
