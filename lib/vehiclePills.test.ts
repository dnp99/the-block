import { describe, expect, it } from "vitest";
import {
  conditionDescriptor,
  conditionPill,
  damagePill,
  reservePill,
  reserveStatusFor,
  titleExplainer,
  titlePill,
} from "@/lib/vehiclePills";
import { makeVehicle } from "@/test/fixtures";

describe("conditionPill", () => {
  it("maps a grade to tone + formatted label", () => {
    expect(conditionPill(4.5)).toEqual({ tone: "green", label: "4.5 / 5" });
    expect(conditionPill(3.0)).toEqual({ tone: "amber", label: "3.0 / 5" });
    expect(conditionPill(2.0)).toEqual({ tone: "red", label: "2.0 / 5" });
  });
});

describe("conditionDescriptor", () => {
  it("words the grade", () => {
    expect(conditionDescriptor(4.6)).toBe("Excellent");
    expect(conditionDescriptor(4.0)).toBe("Good");
    expect(conditionDescriptor(3.0)).toBe("Average");
    expect(conditionDescriptor(2.0)).toBe("Fair");
    expect(conditionDescriptor(1.0)).toBe("Rough");
  });
});

describe("titlePill + titleExplainer", () => {
  it("clean: blue pill, no explainer", () => {
    expect(titlePill("clean")).toEqual({ tone: "blue", label: "Clean title" });
    expect(titleExplainer("clean")).toBeNull();
  });

  it("rebuilt/salvage: tone + risk explainer", () => {
    expect(titlePill("rebuilt").tone).toBe("amber");
    expect(titleExplainer("rebuilt")).toMatch(/total loss/i);
    expect(titlePill("salvage").tone).toBe("red");
    expect(titleExplainer("salvage")).toMatch(/total loss/i);
  });
});

describe("reserveStatusFor / reservePill", () => {
  it("met vs not met by price", () => {
    expect(reserveStatusFor(25000, 20000)).toMatchObject({ met: true, tone: "green" });
    expect(reserveStatusFor(15000, 20000)).toMatchObject({ met: false, tone: "amber" });
  });

  it("reservePill uses the effective price (current bid, else starting)", () => {
    expect(reservePill(makeVehicle({ current_bid: 26000, reserve_price: 20000 })).met).toBe(true);
    expect(
      reservePill(makeVehicle({ current_bid: null, starting_bid: 14500, reserve_price: 20000 })).met,
    ).toBe(false);
  });
});

describe("damagePill", () => {
  it("none vs a disclosure count", () => {
    expect(damagePill(makeVehicle({ damage_notes: [] }))).toMatchObject({
      tone: "green",
      label: "No damage",
    });
    expect(damagePill(makeVehicle({ damage_notes: ["a", "b"] }))).toMatchObject({
      tone: "amber",
      label: "2 disclosures",
    });
  });
});
