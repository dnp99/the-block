import { Card } from "@/components/ui/Card";
import { VinCopy } from "@/components/vehicle/VinCopy";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatKm } from "@/lib/format";

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-ink-subtle">{label}</dt>
      <dd className="text-sm font-medium capitalize text-ink">{value}</dd>
    </div>
  );
}

export function SpecGrid({ vehicle: v }: { vehicle: Vehicle }) {
  return (
    <Card className="p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-semibold text-ink">Specifications</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-ink-subtle">VIN</dt>
          <dd>
            <VinCopy vin={v.vin} className="text-sm font-medium" />
          </dd>
        </div>
        <Spec label="Odometer" value={<span className="normal-case">{formatKm(v.odometer_km)}</span>} />
        <Spec label="Engine" value={v.engine} />
        <Spec label="Transmission" value={v.transmission} />
        <Spec label="Drivetrain" value={v.drivetrain} />
        <Spec label="Fuel type" value={v.fuel_type} />
        <Spec label="Body style" value={v.body_style} />
        <Spec label="Exterior" value={v.exterior_color} />
        <Spec label="Interior" value={v.interior_color} />
        <Spec label="Lot" value={<span className="normal-case">{v.lot}</span>} />
      </dl>
    </Card>
  );
}
