/*
  SearchFilters — the structured shape used by both the manual filter bar and
  (later) the AI natural-language search endpoint. Keeping one shape means the
  same applyFilters() logic serves both. The runtime parser for untrusted AI
  output (parseSearchFilters) is added in the AI-search slice.
*/
import type {
  BodyStyle,
  Drivetrain,
  FuelType,
  TitleStatus,
} from "./vehicle";

export interface SearchFilters {
  /** Free-text tokens matched (AND) against make/model/trim/dealership/body. */
  keywords?: string[];
  make?: string;
  body_style?: BodyStyle;
  province?: string;
  drivetrain?: Drivetrain;
  fuel_type?: FuelType;
  title_status?: TitleStatus;
  odometer_max?: number;
  price_min?: number;
  price_max?: number;
  year_min?: number;
  condition_min?: number;
}

/** True when no usable filter is set (drives the "show all" path). */
export function isEmptyFilters(f: SearchFilters): boolean {
  return Object.values(f).every(
    (v) => v === undefined || (Array.isArray(v) && v.length === 0),
  );
}
