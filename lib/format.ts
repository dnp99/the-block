import type { Vehicle } from "@/lib/contracts/vehicle";

const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});
const plain = new Intl.NumberFormat("en-CA");

/** "$22,800" — whole dollars, CAD. */
export function formatCurrency(n: number): string {
  return cad.format(n);
}

/** "47,731 km" */
export function formatKm(n: number): string {
  return `${plain.format(n)} km`;
}

/** "3.8 / 5" */
export function formatGrade(n: number): string {
  return `${n.toFixed(1)} / 5`;
}

/** "2023 Ford Bronco" */
export function vehicleTitle(v: Pick<Vehicle, "year" | "make" | "model">): string {
  return `${v.year} ${v.make} ${v.model}`;
}

/** "Toronto, Ontario" */
export function vehicleLocation(v: Pick<Vehicle, "city" | "province">): string {
  return `${v.city}, ${v.province}`;
}

/** The price a buyer competes against: current bid, or starting bid if none yet. */
export function effectivePrice(
  v: Pick<Vehicle, "current_bid" | "starting_bid">,
): number {
  return v.current_bid ?? v.starting_bid;
}
