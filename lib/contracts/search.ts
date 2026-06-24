import {
  BODY_STYLES,
  DRIVETRAINS,
  FUEL_TYPES,
  TITLE_STATUSES,
  type BodyStyle,
  type Drivetrain,
  type FuelType,
  type TitleStatus,
} from "./vehicle";

export interface SearchFilters {
  keywords?: string[];
  make?: string;
  body_style?: BodyStyle;
  province?: string;
  drivetrain?: Drivetrain;
  fuel_type?: FuelType;
  title_status?: TitleStatus;
  odometer_min?: number;
  odometer_max?: number;
  price_min?: number;
  price_max?: number;
  year_min?: number;
  year_max?: number;
  condition_min?: number;
}
export function isEmptyFilters(f: SearchFilters): boolean {
  return Object.values(f).every(
    (v) => v === undefined || (Array.isArray(v) && v.length === 0),
  );
}

const inEnum = <T extends readonly string[]>(set: T, v: unknown): v is T[number] =>
  typeof v === "string" && (set as readonly string[]).includes(v);

function posNumber(v: unknown): number | undefined {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : undefined;
}
export function parseSearchFilters(input: unknown): SearchFilters {
  if (typeof input !== "object" || input === null) return {};
  const o = input as Record<string, unknown>;
  const out: SearchFilters = {};

  if (Array.isArray(o.keywords)) {
    const kw = o.keywords
      .filter((k): k is string => typeof k === "string")
      .map((k) => k.trim())
      .filter(Boolean);
    if (kw.length) out.keywords = kw;
  }
  if (typeof o.make === "string" && o.make.trim()) out.make = o.make.trim();
  if (typeof o.province === "string" && o.province.trim()) out.province = o.province.trim();
  if (inEnum(BODY_STYLES, o.body_style)) out.body_style = o.body_style;
  if (inEnum(DRIVETRAINS, o.drivetrain)) out.drivetrain = o.drivetrain;
  if (inEnum(FUEL_TYPES, o.fuel_type)) out.fuel_type = o.fuel_type;
  if (inEnum(TITLE_STATUSES, o.title_status)) out.title_status = o.title_status;

  const odoMin = posNumber(o.odometer_min);
  if (odoMin) out.odometer_min = odoMin;
  const odoMax = posNumber(o.odometer_max);
  if (odoMax) out.odometer_max = odoMax;
  const priceMin = posNumber(o.price_min);
  if (priceMin) out.price_min = priceMin;
  const priceMax = posNumber(o.price_max);
  if (priceMax) out.price_max = priceMax;
  const yearMin = posNumber(o.year_min);
  if (yearMin) out.year_min = yearMin;
  const yearMax = posNumber(o.year_max);
  if (yearMax) out.year_max = yearMax;
  const cond = posNumber(o.condition_min);
  if (cond !== undefined && cond <= 5) out.condition_min = cond;

  return out;
}
