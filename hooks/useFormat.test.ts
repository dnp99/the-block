import { describe, expect, it } from "vitest";
import { useFormat } from "@/hooks/useFormat";
import { renderHookWithIntl } from "@/test/intl";

const norm = (s: string) => s.replace(/\s/g, " ");

describe("useFormat", () => {
  it("formats en-CA by default", () => {
    const { result } = renderHookWithIntl(() => useFormat());
    expect(result.current.locale).toBe("en-CA");
    expect(result.current.currency(25000)).toBe("$25,000");
    expect(result.current.km(47731)).toBe("47,731 km");
    expect(result.current.number(1000)).toBe("1,000");
  });

  it("formats fr-CA when the locale is fr", () => {
    const { result } = renderHookWithIntl(() => useFormat(), "fr");
    expect(result.current.locale).toBe("fr-CA");
    expect(norm(result.current.currency(25000))).toBe("25 000 $");
    expect(norm(result.current.km(47731))).toBe("47 731 km");
  });
});
