/*
  Vehicle data access. The dataset is a static bundled import (no runtime fetch,
  no load-failure path). Records are validated once at module load through
  isVehicle — anything malformed is dropped loudly rather than crashing the UI.
*/
import raw from "@/data/vehicles.json";
import { isVehicle, type Vehicle } from "@/lib/contracts/vehicle";

const all: Vehicle[] = (raw as unknown[]).filter((r): r is Vehicle => {
  const ok = isVehicle(r);
  if (!ok && process.env.NODE_ENV !== "production") {
    console.warn("[data] dropped invalid vehicle record", r);
  }
  return ok;
});

export function getAllVehicles(): Vehicle[] {
  return all;
}

export function getVehicleById(id: string): Vehicle | undefined {
  return all.find((v) => v.id === id);
}

/** Sorted unique values for a field — used to build filter dropdowns. */
export function facetValues<K extends keyof Vehicle>(field: K): Array<Vehicle[K]> {
  return [...new Set(all.map((v) => v[field]))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}
