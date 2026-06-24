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

  it("matches all keywords (AND across fields)", () => {
    expect(applyFilters(fleet, { keywords: ["ford", "truck"] }).map((v) => v.id)).toEqual(["c"]);
    expect(applyFilters(fleet, { keywords: ["tesla", "truck"] })).toHaveLength(0);
  });

  it("filters by enum fields", () => {
    expect(applyFilters(fleet, { fuel_type: "electric" }).map((v) => v.id)).toEqual(["b"]);
    expect(applyFilters(fleet, { title_status: "salvage" }).map((v) => v.id)).toEqual(["c"]);
    expect(applyFilters(fleet, { condition_min: 4 }).map((v) => v.id).sort()).toEqual(["a", "b"]);
  });
});

describe("sortVehicles", () => {
  it("sorts price ascending and descending without mutating input", () => {
    const asc = sortVehicles(fleet, "price-asc");
    expect(asc.map((v) => v.id)).toEqual(["c", "a", "b"]);
    expect(sortVehicles(fleet, "price-desc").map((v) => v.id)).toEqual(["b", "a", "c"]);
    expect(fleet[0].id).toBe("a"); // original order intact
  });

  it("sorts by best condition", () => {
    expect(sortVehicles(fleet, "condition").map((v) => v.id)).toEqual(["b", "a", "c"]);
  });

  it("uses starting_bid for price when current_bid is null (no bids yet)", () => {
    const noBids = makeVehicle({ id: "d", current_bid: null, starting_bid: 5000 });
    const sorted = sortVehicles([...fleet, noBids], "price-asc");
    expect(sorted[0].id).toBe("d"); // 5000 starting bid is the lowest
    expect(applyFilters([noBids], { price_max: 6000 })).toHaveLength(1);
    expect(applyFilters([noBids], { price_max: 4000 })).toHaveLength(0);
  });
});
