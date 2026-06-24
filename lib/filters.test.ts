import { describe, expect, it } from "vitest";
import { applyFilters, sortVehicles } from "@/lib/filters";
import type { Vehicle } from "@/lib/contracts/vehicle";

function makeVehicle(over: Partial<Vehicle>): Vehicle {
  return {
    id: "id",
    vin: "VIN",
    year: 2022,
    make: "Ford",
    model: "Bronco",
    trim: "Big Bend",
    body_style: "SUV",
    exterior_color: "Burgundy",
    interior_color: "Beige",
    engine: "2.7L V6",
    transmission: "automatic",
    drivetrain: "4WD",
    odometer_km: 50000,
    fuel_type: "gasoline",
    condition_grade: 3.8,
    condition_report: "Average.",
    damage_notes: [],
    title_status: "clean",
    province: "Ontario",
    city: "Toronto",
    auction_start: "2026-04-05T14:00:00",
    starting_bid: 14500,
    reserve_price: 25000,
    buy_now_price: null,
    images: ["https://placehold.co/800x600"],
    selling_dealership: "King City Auto",
    lot: "A-0043",
    current_bid: 22800,
    bid_count: 16,
    ...over,
  };
}

const fleet: Vehicle[] = [
  makeVehicle({ id: "a", make: "Ford", body_style: "SUV", odometer_km: 30000, current_bid: 20000, condition_grade: 4.2 }),
  makeVehicle({ id: "b", make: "Tesla", body_style: "sedan", odometer_km: 10000, current_bid: 40000, condition_grade: 4.8, fuel_type: "electric" }),
  makeVehicle({ id: "c", make: "Ford", body_style: "truck", odometer_km: 90000, current_bid: 15000, condition_grade: 2.1, title_status: "salvage" }),
];

describe("applyFilters", () => {
  it("returns everything for empty filters", () => {
    expect(applyFilters(fleet, {})).toHaveLength(3);
  });

  it("narrows by make (case-insensitive)", () => {
    const r = applyFilters(fleet, { make: "ford" });
    expect(r.map((v) => v.id).sort()).toEqual(["a", "c"]);
  });

  it("applies odometer_max and price_max together (AND)", () => {
    const r = applyFilters(fleet, { odometer_max: 50000, price_max: 25000 });
    expect(r.map((v) => v.id)).toEqual(["a"]);
  });

  it("applies a price range (price_min..price_max) on effective price", () => {
    expect(applyFilters(fleet, { price_min: 18000 }).map((v) => v.id).sort()).toEqual(["a", "b"]);
    expect(applyFilters(fleet, { price_min: 16000, price_max: 25000 }).map((v) => v.id)).toEqual(["a"]);
  });

  it("applies year and odometer ranges", () => {
    const fleetYears = [
      makeVehicle({ id: "y1", year: 2018, odometer_km: 30000 }),
      makeVehicle({ id: "y2", year: 2022, odometer_km: 60000 }),
      makeVehicle({ id: "y3", year: 2025, odometer_km: 90000 }),
    ];
    expect(applyFilters(fleetYears, { year_min: 2020, year_max: 2024 }).map((v) => v.id)).toEqual(["y2"]);
    expect(applyFilters(fleetYears, { odometer_min: 40000, odometer_max: 80000 }).map((v) => v.id)).toEqual(["y2"]);
  });

  it("matches all keywords (AND across fields)", () => {
    expect(applyFilters(fleet, { keywords: ["ford", "truck"] }).map((v) => v.id)).toEqual(["c"]);
    expect(applyFilters(fleet, { keywords: ["tesla", "truck"] })).toHaveLength(0);
  });

  it("filters by enum fields", () => {
    expect(applyFilters(fleet, { fuel_type: "electric" }).map((v) => v.id)).toEqual(["b"]);
    expect(applyFilters(fleet, { title_status: "salvage" }).map((v) => v.id)).toEqual(["c"]);
    expect(applyFilters(fleet, { condition_min: 4 }).map((v) => v.id).sort()).toEqual(["a", "b"]);
  });

  it("uses starting_bid for effective price when current_bid is null (no bids yet)", () => {
    const noBids = makeVehicle({ id: "d", current_bid: null, starting_bid: 5000 });
    expect(applyFilters([noBids], { price_max: 6000 })).toHaveLength(1);
    expect(applyFilters([noBids], { price_max: 4000 })).toHaveLength(0);
  });
});

describe("sortVehicles", () => {
  it("sorts mileage low and high without mutating input", () => {
    expect(sortVehicles(fleet, "odometer-asc").map((v) => v.id)).toEqual(["b", "a", "c"]);
    expect(sortVehicles(fleet, "odometer-desc").map((v) => v.id)).toEqual(["c", "a", "b"]);
    expect(fleet[0].id).toBe("a");
  });

  it("sorts by make alphabetically (model as tiebreak)", () => {
    expect(sortVehicles(fleet, "make").map((v) => v.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by year, oldest and newest", () => {
    const years = [
      makeVehicle({ id: "y1", year: 2025 }),
      makeVehicle({ id: "y2", year: 2018 }),
      makeVehicle({ id: "y3", year: 2022 }),
    ];
    expect(sortVehicles(years, "year-asc").map((v) => v.id)).toEqual(["y2", "y3", "y1"]);
    expect(sortVehicles(years, "year-desc").map((v) => v.id)).toEqual(["y1", "y3", "y2"]);
  });

  it("sorts by seller name", () => {
    const sellers = [
      makeVehicle({ id: "s1", selling_dealership: "Zenith Motors" }),
      makeVehicle({ id: "s2", selling_dealership: "Apex Auto" }),
      makeVehicle({ id: "s3", selling_dealership: "Maple Cars" }),
    ];
    expect(sortVehicles(sellers, "seller").map((v) => v.id)).toEqual(["s2", "s3", "s1"]);
  });
});
