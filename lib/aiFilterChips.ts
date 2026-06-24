import type { SearchFilters } from "@/lib/contracts/search";

export interface AiChipDescriptor {
  key: string;
  label: string;
  filterKey: keyof SearchFilters;
}

export function buildAiFilterChips(
  ai: SearchFilters,
  format: { number: (n: number) => string; currency: (n: number) => string },
): AiChipDescriptor[] {
  const chips: AiChipDescriptor[] = [];

  if (ai.keywords?.length) {
    chips.push({
      key: "ai-kw",
      label: `✨ “${ai.keywords.join(" ")}”`,
      filterKey: "keywords",
    });
  }
  if (ai.make) chips.push({ key: "ai-make", label: `✨ ${ai.make}`, filterKey: "make" });
  if (ai.body_style) {
    chips.push({ key: "ai-body", label: `✨ ${ai.body_style}`, filterKey: "body_style" });
  }
  if (ai.drivetrain) {
    chips.push({ key: "ai-dt", label: `✨ ${ai.drivetrain}`, filterKey: "drivetrain" });
  }
  if (ai.fuel_type) {
    chips.push({ key: "ai-fuel", label: `✨ ${ai.fuel_type}`, filterKey: "fuel_type" });
  }
  if (ai.title_status) {
    chips.push({
      key: "ai-title",
      label: `✨ ${ai.title_status} title`,
      filterKey: "title_status",
    });
  }
  if (ai.province) {
    chips.push({ key: "ai-prov", label: `✨ ${ai.province}`, filterKey: "province" });
  }
  if (ai.odometer_min) {
    chips.push({
      key: "ai-odomin",
      label: `✨ ≥ ${format.number(ai.odometer_min)} km`,
      filterKey: "odometer_min",
    });
  }
  if (ai.odometer_max) {
    chips.push({
      key: "ai-odomax",
      label: `✨ ≤ ${format.number(ai.odometer_max)} km`,
      filterKey: "odometer_max",
    });
  }
  if (ai.price_min) {
    chips.push({
      key: "ai-pmin",
      label: `✨ ≥ ${format.currency(ai.price_min)}`,
      filterKey: "price_min",
    });
  }
  if (ai.price_max) {
    chips.push({
      key: "ai-pmax",
      label: `✨ ≤ ${format.currency(ai.price_max)}`,
      filterKey: "price_max",
    });
  }
  if (ai.year_min) {
    chips.push({ key: "ai-ymin", label: `✨ ${ai.year_min}+`, filterKey: "year_min" });
  }
  if (ai.year_max) {
    chips.push({ key: "ai-ymax", label: `✨ ≤ ${ai.year_max}`, filterKey: "year_max" });
  }
  if (ai.condition_min) {
    chips.push({
      key: "ai-cond",
      label: `✨ Condition ${ai.condition_min}+`,
      filterKey: "condition_min",
    });
  }

  return chips;
}
