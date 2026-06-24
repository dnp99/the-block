import { Card } from "@/components/ui/Card";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { vehicleLocation } from "@/lib/format";

export function DealerBlock({ vehicle: v }: { vehicle: Vehicle }) {
  const initial = v.selling_dealership.charAt(0).toUpperCase();
  return (
    <Card className="flex items-center gap-3 p-4 sm:p-5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-100 text-base font-bold text-primary-700">
        {initial}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-subtle">Selling dealership</p>
        <p className="truncate font-semibold text-ink">{v.selling_dealership}</p>
        <p className="text-sm text-ink-muted">{vehicleLocation(v)}</p>
      </div>
    </Card>
  );
}
