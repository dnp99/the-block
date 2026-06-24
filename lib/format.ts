import type { Vehicle } from "@/lib/contracts/vehicle";

// Cache one formatter per locale (en-CA: "$22,800" · fr-CA: "22 800 $").
const currencyFmt = new Map<string, Intl.NumberFormat>();
const numberFmt = new Map<string, Intl.NumberFormat>();

function currencyFormatter(locale: string): Intl.NumberFormat {
  let f = currencyFmt.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    });
    currencyFmt.set(locale, f);
  }
  return f;
}

function numberFormatter(locale: string): Intl.NumberFormat {
  let f = numberFmt.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale);
    numberFmt.set(locale, f);
  }
  return f;
}

/** "$22,800" (en-CA) · "22 800 $" (fr-CA) — whole dollars, CAD. */
export function formatCurrency(n: number, locale = "en-CA"): string {
  return currencyFormatter(locale).format(n);
}

/** "47,731 km" (en-CA) · "47 731 km" (fr-CA) */
export function formatKm(n: number, locale = "en-CA"): string {
  return `${numberFormatter(locale).format(n)} km`;
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

/** Sentence-case the first letter ("rebuilt" → "Rebuilt"). */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The price a buyer competes against: current bid, or starting bid if none yet. */
export function effectivePrice(
  v: Pick<Vehicle, "current_bid" | "starting_bid">,
): number {
  return v.current_bid ?? v.starting_bid;
}
