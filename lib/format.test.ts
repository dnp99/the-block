import { describe, expect, it } from "vitest";
import {
  capitalize,
  effectivePrice,
  formatCurrency,
  formatGrade,
  formatKm,
  vehicleLocation,
  vehicleTitle,
} from "@/lib/format";

// fr-CA uses non-breaking / narrow-no-break spaces (U+00A0 / U+202F) as group
// and pre-symbol separators; normalize them so assertions are ICU-version-stable.
const norm = (s: string) => s.replace(/\s/g, " ");

describe("formatCurrency", () => {
  it("formats en-CA by default ($ before, comma groups)", () => {
    expect(formatCurrency(25000)).toBe("$25,000");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats fr-CA (space groups, trailing $)", () => {
    expect(norm(formatCurrency(25000, "fr-CA"))).toBe("25 000 $");
  });

  it("has no fractional digits", () => {
    expect(formatCurrency(1999.99)).toBe("$2,000");
  });
});

describe("formatKm", () => {
  it("appends km with locale grouping", () => {
    expect(formatKm(47731)).toBe("47,731 km");
    expect(norm(formatKm(47731, "fr-CA"))).toBe("47 731 km");
  });
});

describe("formatGrade", () => {
  it("always shows one decimal out of 5", () => {
    expect(formatGrade(3.8)).toBe("3.8 / 5");
    expect(formatGrade(4)).toBe("4.0 / 5");
  });
});

describe("vehicleTitle / vehicleLocation / capitalize", () => {
  it("builds the title", () => {
    expect(vehicleTitle({ year: 2025, make: "Toyota", model: "Tacoma" })).toBe(
      "2025 Toyota Tacoma",
    );
  });

  it("builds the location", () => {
    expect(vehicleLocation({ city: "Hamilton", province: "Ontario" })).toBe("Hamilton, Ontario");
  });

  it("capitalizes the first letter", () => {
    expect(capitalize("rebuilt")).toBe("Rebuilt");
    expect(capitalize("")).toBe("");
  });
});

describe("effectivePrice", () => {
  it("uses current_bid when present", () => {
    expect(effectivePrice({ current_bid: 22800, starting_bid: 14500 })).toBe(22800);
  });

  it("falls back to starting_bid when there are no bids", () => {
    expect(effectivePrice({ current_bid: null, starting_bid: 14500 })).toBe(14500);
  });
});
