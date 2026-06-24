import { describe, expect, it } from "vitest";
import { buildAiFilterChips } from "@/lib/aiFilterChips";

describe("buildAiFilterChips", () => {
  it("returns an empty list when no AI filters are set", () => {
    expect(
      buildAiFilterChips({}, { number: (n) => String(n), currency: (n) => String(n) }),
    ).toEqual([]);
  });

  it("maps AI filters to chip descriptors with formatted labels", () => {
    const chips = buildAiFilterChips(
      {
        keywords: ["awd", "suv"],
        make: "Tesla",
        price_max: 20000,
        odometer_min: 10000,
        year_min: 2020,
      },
      {
        number: (n) => `N${n}`,
        currency: (n) => `$${n}`,
      },
    );

    expect(chips).toEqual([
      { key: "ai-kw", label: "✨ “awd suv”", filterKey: "keywords" },
      { key: "ai-make", label: "✨ Tesla", filterKey: "make" },
      { key: "ai-odomin", label: "✨ ≥ N10000 km", filterKey: "odometer_min" },
      { key: "ai-pmax", label: "✨ ≤ $20000", filterKey: "price_max" },
      { key: "ai-ymin", label: "✨ 2020+", filterKey: "year_min" },
    ]);
  });
});
