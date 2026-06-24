export const BODY_STYLES = ["SUV", "hatchback", "truck", "sedan", "coupe"] as const;
export const DRIVETRAINS = ["FWD", "AWD", "4WD", "RWD"] as const;
export const TRANSMISSIONS = ["automatic", "manual", "CVT", "single-speed"] as const;
export const FUEL_TYPES = ["gasoline", "hybrid", "electric", "diesel"] as const;
export const TITLE_STATUSES = ["clean", "salvage", "rebuilt"] as const;
export const PROVINCES = [
  "Ontario",
  "British Columbia",
  "Alberta",
  "Quebec",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
] as const;

export type BodyStyle = (typeof BODY_STYLES)[number];
export type Drivetrain = (typeof DRIVETRAINS)[number];
export type Transmission = (typeof TRANSMISSIONS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type TitleStatus = (typeof TITLE_STATUSES)[number];
export type Province = (typeof PROVINCES)[number];

export interface Vehicle {
  id: string;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  body_style: BodyStyle;
  exterior_color: string;
  interior_color: string;
  engine: string;
  transmission: Transmission;
  drivetrain: Drivetrain;
  odometer_km: number;
  fuel_type: FuelType;
  condition_grade: number;
  condition_report: string;
  damage_notes: string[];
  title_status: TitleStatus;
  province: Province;
  city: string;
  auction_start: string;
  starting_bid: number;
  reserve_price: number;
  buy_now_price: number | null;
  images: string[];
  selling_dealership: string;
  lot: string;
  current_bid: number | null;
  bid_count: number;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}
export function isVehicle(v: unknown): v is Vehicle {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.vin === "string" &&
    typeof o.year === "number" &&
    typeof o.make === "string" &&
    typeof o.model === "string" &&
    typeof o.body_style === "string" &&
    typeof o.odometer_km === "number" &&
    typeof o.condition_grade === "number" &&
    typeof o.condition_report === "string" &&
    isStringArray(o.damage_notes) &&
    typeof o.title_status === "string" &&
    (o.current_bid === null || typeof o.current_bid === "number") &&
    typeof o.starting_bid === "number" &&
    typeof o.bid_count === "number" &&
    isStringArray(o.images) &&
    (o.buy_now_price === null || typeof o.buy_now_price === "number")
  );
}
