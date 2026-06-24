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
export function facetValues<K extends keyof Vehicle>(field: K): Array<Vehicle[K]> {
  return [...new Set(all.map((v) => v[field]))].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
}
