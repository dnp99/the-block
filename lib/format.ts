import type { Vehicle } from "@/lib/contracts/vehicle";

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
export function formatCurrency(n: number, locale = "en-CA"): string {
  return currencyFormatter(locale).format(n);
}
export function formatKm(n: number, locale = "en-CA"): string {
  return `${numberFormatter(locale).format(n)} km`;
}
export function formatGrade(n: number): string {
  return `${n.toFixed(1)} / 5`;
}
export function vehicleTitle(v: Pick<Vehicle, "year" | "make" | "model">): string {
  return `${v.year} ${v.make} ${v.model}`;
}
export function vehicleLocation(v: Pick<Vehicle, "city" | "province">): string {
  return `${v.city}, ${v.province}`;
}
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
export function effectivePrice(
  v: Pick<Vehicle, "current_bid" | "starting_bid">,
): number {
  return v.current_bid ?? v.starting_bid;
}
