import { describe, expect, it } from "vitest";
import { parseSearchFilters } from "@/lib/contracts/search";

describe("parseSearchFilters", () => {
  it("keeps valid fields and enum values", () => {
    expect(
      parseSearchFilters({
        make: " Tesla ",
        body_style: "SUV",
        drivetrain: "AWD",
        fuel_type: "electric",
        title_status: "clean",
        province: "Ontario",
        price_max: 20000,
        odometer_max: "60000",
        year_min: 2020,
        condition_min: 4,
        keywords: ["bronco", "  ", 5],
      }),
    ).toEqual({
      make: "Tesla",
      body_style: "SUV",
      drivetrain: "AWD",
      fuel_type: "electric",
      title_status: "clean",
      province: "Ontario",
      price_max: 20000,
      odometer_max: 60000,
      year_min: 2020,
      condition_min: 4,
      keywords: ["bronco"],
    });
  });

  it("drops invalid enums, non-positive numbers, and bad input", () => {
    expect(parseSearchFilters({ body_style: "spaceship", drivetrain: "6WD" })).toEqual({});
    expect(parseSearchFilters({ price_max: -5, condition_min: 9 })).toEqual({});
    expect(parseSearchFilters(null)).toEqual({});
    expect(parseSearchFilters("nope")).toEqual({});
  });
});
