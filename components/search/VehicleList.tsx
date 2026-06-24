"use client";

import { useTranslations } from "next-intl";
import { VehicleRow } from "@/components/search/VehicleRow";
import type { PhasedVehicle } from "@/components/search/SearchView";

export function VehicleList({
  items,
  nowMs,
}: {
  items: PhasedVehicle[];
  nowMs: number;
}) {
  const t = useTranslations("states");
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-4 py-16 text-center">
        <p className="text-sm font-semibold text-ink">{t("emptyTitle")}</p>
        <p className="mt-1 text-sm text-ink-muted">{t("emptyBody")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ vehicle, state }) => (
        <VehicleRow key={vehicle.id} vehicle={vehicle} state={state} nowMs={nowMs} />
      ))}
    </div>
  );
}
