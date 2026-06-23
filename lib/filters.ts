/*
  Pure filter + sort logic over the vehicle list. No React, no I/O — so it is
  trivially unit-testable and shared by the manual filter bar and AI search.
*/
import type { Vehicle } from "@/lib/contracts/vehicle";
import type { SearchFilters } from "@/lib/contracts/search";
import { effectivePrice } from "@/lib/format";

export const SORT_OPTIONS = [
  { key: "bids", label: "Most bids" },
  { key: "ending", label: "Ending soonest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "odometer", label: "Lowest km" },
  { key: "year", label: "Newest year" },
  { key: "condition", label: "Best condition" },
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

/** Apply a SearchFilters to the list. Every set field narrows (AND). */
export function applyFilters(vehicles: Vehicle[], f: SearchFilters): Vehicle[] {
  return vehicles.filter((v) => {
    if (f.keywords && !f.keywords.every((kw) => matchesKeyword(v, kw))) return false;
    if (f.make && v.make.toLowerCase() !== f.make.toLowerCase()) return false;
    if (f.province && v.province.toLowerCase() !== f.province.toLowerCase()) return false;
    if (f.body_style && v.body_style !== f.body_style) return false;
    if (f.drivetrain && v.drivetrain !== f.drivetrain) return false;
    if (f.fuel_type && v.fuel_type !== f.fuel_type) return false;
    if (f.title_status && v.title_status !== f.title_status) return false;
    if (f.odometer_max != null && v.odometer_km > f.odometer_max) return false;
    if (f.price_max != null && effectivePrice(v) > f.price_max) return false;
    if (f.year_min != null && v.year < f.year_min) return false;
    if (f.condition_min != null && v.condition_grade < f.condition_min) return false;
    return true;
  });
}

/** Return a new sorted array (does not mutate the input). */
export function sortVehicles(vehicles: Vehicle[], key: SortKey): Vehicle[] {
  const out = [...vehicles];
  switch (key) {
    case "bids":
      return out.sort((a, b) => b.bid_count - a.bid_count);
    case "ending":
      return out.sort((a, b) => a.auction_start.localeCompare(b.auction_start));
    case "price-asc":
      return out.sort((a, b) => effectivePrice(a) - effectivePrice(b));
    case "price-desc":
      return out.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    case "odometer":
      return out.sort((a, b) => a.odometer_km - b.odometer_km);
    case "year":
      return out.sort((a, b) => b.year - a.year);
    case "condition":
      return out.sort((a, b) => b.condition_grade - a.condition_grade);
    default:
      return out;
  }
}
