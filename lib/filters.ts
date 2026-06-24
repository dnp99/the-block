import { auctionStartMs } from "@/lib/auction";
import type { Vehicle } from "@/lib/contracts/vehicle";
import type { SearchFilters } from "@/lib/contracts/search";
import { effectivePrice } from "@/lib/format";

export const SORT_OPTIONS = [
  { key: "year-asc", label: "Oldest year" },
  { key: "year-desc", label: "Newest year" },
  { key: "make", label: "Make" },
  { key: "odometer-asc", label: "Mileage low" },
  { key: "odometer-desc", label: "Mileage high" },
  { key: "seller", label: "Seller name" },
  { key: "ending", label: "Ending soonest" },
  { key: "starting", label: "Starting soonest" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

function matchesKeyword(v: Vehicle, kw: string): boolean {
  const haystack = [
    v.make,
    v.model,
    v.trim,
    v.body_style,
    v.selling_dealership,
    v.city,
    v.province,
    v.fuel_type,
    v.drivetrain,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(kw.toLowerCase());
}
export function applyFilters(vehicles: Vehicle[], f: SearchFilters): Vehicle[] {
  return vehicles.filter((v) => {
    if (f.keywords && !f.keywords.every((kw) => matchesKeyword(v, kw))) return false;
    if (f.make && v.make.toLowerCase() !== f.make.toLowerCase()) return false;
    if (f.province && v.province.toLowerCase() !== f.province.toLowerCase()) return false;
    if (f.body_style && v.body_style !== f.body_style) return false;
    if (f.drivetrain && v.drivetrain !== f.drivetrain) return false;
    if (f.fuel_type && v.fuel_type !== f.fuel_type) return false;
    if (f.title_status && v.title_status !== f.title_status) return false;
    if (f.odometer_min != null && v.odometer_km < f.odometer_min) return false;
    if (f.odometer_max != null && v.odometer_km > f.odometer_max) return false;
    if (f.price_min != null && effectivePrice(v) < f.price_min) return false;
    if (f.price_max != null && effectivePrice(v) > f.price_max) return false;
    if (f.year_min != null && v.year < f.year_min) return false;
    if (f.year_max != null && v.year > f.year_max) return false;
    if (f.condition_min != null && v.condition_grade < f.condition_min) return false;
    return true;
  });
}
export function sortVehicles(vehicles: Vehicle[], key: SortKey, auctionNowMs = 0): Vehicle[] {
  const out = [...vehicles];
  switch (key) {
    case "year-asc":
      return out.sort((a, b) => a.year - b.year);
    case "year-desc":
      return out.sort((a, b) => b.year - a.year);
    case "make":
      return out.sort((a, b) => a.make.localeCompare(b.make) || a.model.localeCompare(b.model));
    case "odometer-asc":
      return out.sort((a, b) => a.odometer_km - b.odometer_km);
    case "odometer-desc":
      return out.sort((a, b) => b.odometer_km - a.odometer_km);
    case "seller":
      return out.sort((a, b) => a.selling_dealership.localeCompare(b.selling_dealership));
    case "ending":
    case "starting":
      return out.sort(
        (a, b) => auctionStartMs(a.id, auctionNowMs) - auctionStartMs(b.id, auctionNowMs),
      );
    default:
      return out;
  }
}
