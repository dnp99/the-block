import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, intlLocale, isLocale, LOCALES } from "@/lib/i18n";

describe("isLocale", () => {
  it("accepts supported locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale(42)).toBe(false);
  });
});

describe("intlLocale", () => {
  it("maps to Canadian BCP-47 tags", () => {
    expect(intlLocale("fr")).toBe("fr-CA");
    expect(intlLocale("en")).toBe("en-CA");
  });

  it("defaults to en-CA for unknown input", () => {
    expect(intlLocale("de")).toBe("en-CA");
  });
});

describe("locale constants", () => {
  it("defaults to English and lists en + fr", () => {
    expect(DEFAULT_LOCALE).toBe("en");
    expect([...LOCALES]).toEqual(["en", "fr"]);
  });
});
