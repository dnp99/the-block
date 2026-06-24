import { describe, expect, it } from "vitest";
import { isVehicle } from "@/lib/contracts/vehicle";

// Minimal record with every field isVehicle inspects.
const valid: Record<string, unknown> = {
  id: "v1",
  vin: "1HGCM82633A004352",
  year: 2025,
  make: "Toyota",
  model: "Tacoma",
  body_style: "truck",
  odometer_km: 23495,
  condition_grade: 3.5,
  condition_report: "Above-average condition.",
  damage_notes: [],
  title_status: "clean",
  current_bid: null,
  starting_bid: 14500,
  bid_count: 0,
  images: ["a.jpg"],
  buy_now_price: null,
};

describe("isVehicle", () => {
  it("accepts a well-formed record", () => {
    expect(isVehicle(valid)).toBe(true);
  });

  it("accepts a no-bid record (current_bid null)", () => {
    expect(isVehicle({ ...valid, current_bid: null, bid_count: 0 })).toBe(true);
  });

  it("accepts numeric current_bid and buy_now_price", () => {
    expect(isVehicle({ ...valid, current_bid: 22800, buy_now_price: 30000 })).toBe(true);
  });

  it("rejects non-objects", () => {
    expect(isVehicle(null)).toBe(false);
    expect(isVehicle(undefined)).toBe(false);
    expect(isVehicle("vehicle")).toBe(false);
    expect(isVehicle(42)).toBe(false);
  });

  it("rejects a missing required field", () => {
    const { year, ...withoutYear } = valid;
    void year;
    expect(isVehicle(withoutYear)).toBe(false);
  });

  it("rejects a wrong-typed field", () => {
    expect(isVehicle({ ...valid, year: "2025" })).toBe(false);
    expect(isVehicle({ ...valid, odometer_km: "lots" })).toBe(false);
  });

  it("rejects current_bid that is a string (not number|null)", () => {
    expect(isVehicle({ ...valid, current_bid: "22800" })).toBe(false);
  });

  it("rejects malformed array fields", () => {
    expect(isVehicle({ ...valid, damage_notes: [1, 2] })).toBe(false);
    expect(isVehicle({ ...valid, damage_notes: "dent" })).toBe(false);
    expect(isVehicle({ ...valid, images: [null] })).toBe(false);
  });
});
