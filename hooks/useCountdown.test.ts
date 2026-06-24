import { describe, expect, it } from "vitest";
import { useCountdownBadge, useCountdownLabel } from "@/hooks/useCountdown";
import type { AuctionState } from "@/lib/auction";
import { renderHookWithIntl } from "@/test/intl";

const NOW = 1_700_000_000_000;
const live = (msLeft: number): AuctionState => ({ phase: "live", startMs: NOW - 1000, endMs: NOW + msLeft });
const upcoming = (msAhead: number): AuctionState => ({ phase: "upcoming", startMs: NOW + msAhead, endMs: NOW + msAhead + 1 });
const ended: AuctionState = { phase: "ended", startMs: NOW - 100, endMs: NOW - 50 };

describe("useCountdownLabel", () => {
  it("formats live/ended in English", () => {
    const { result } = renderHookWithIntl(() => useCountdownLabel());
    expect(result.current(live(125_000), NOW)).toBe("Ends in 2m 5s");
    expect(result.current(ended, NOW)).toBe("Auction ended");
  });

  it("formats in French", () => {
    const { result } = renderHookWithIntl(() => useCountdownLabel(), "fr");
    expect(result.current(live(125_000), NOW)).toBe("Se termine dans 2 min 5 s");
    expect(result.current(ended, NOW)).toBe("Enchère terminée");
  });
});

describe("useCountdownBadge", () => {
  it("uses the single largest unit", () => {
    const { result } = renderHookWithIntl(() => useCountdownBadge());
    expect(result.current(live(2 * 3600_000 + 5 * 60_000), NOW)).toBe("2h left");
    expect(result.current(upcoming(2 * 86_400_000 + 3600_000), NOW)).toBe("Starts in 2d");
    expect(result.current(ended, NOW)).toBe("Auction over");
  });
});
