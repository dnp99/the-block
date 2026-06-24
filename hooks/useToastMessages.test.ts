import { describe, expect, it } from "vitest";
import { useToastMessages } from "@/hooks/useToastMessages";
import { renderHookWithIntl } from "@/test/intl";

const norm = (s: string) => s.replace(/\s/g, " ");
const v = { year: 2025, make: "Toyota", model: "Tacoma" };

describe("useToastMessages", () => {
  it("names the vehicle + amount (en)", () => {
    const { result } = renderHookWithIntl(() => useToastMessages());
    expect(result.current.bidPlaced(v, 26100)).toBe("Bid placed. $26,100 for 2025 Toyota Tacoma");
    expect(result.current.boughtNow(v, 33000)).toBe("Bought now. $33,000 for 2025 Toyota Tacoma");
    expect(result.current.bidFailed).toBe("Couldn’t place your bid, please try again");
    expect(result.current.aiSearchUnavailable).toBe("AI search unavailable. Using basic search");
  });

  it("localizes for French", () => {
    const { result } = renderHookWithIntl(() => useToastMessages(), "fr");
    expect(norm(result.current.bidPlaced(v, 26100))).toBe(
      "Enchère placée. 26 100 $ pour 2025 Toyota Tacoma",
    );
  });
});
