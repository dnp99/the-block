import { describe, expect, it } from "vitest";
import { buildBidHistory, formatAgo } from "@/lib/bidHistory";
import type { Vehicle } from "@/lib/contracts/vehicle";

const base = {
  id: "veh-1",
  starting_bid: 10000,
  current_bid: 18000,
  bid_count: 6,
} as unknown as Vehicle;

describe("buildBidHistory", () => {
  it("returns empty when there are no bids", () => {
    expect(buildBidHistory({ ...base, current_bid: null, bid_count: 0 }, undefined, 0)).toEqual([]);
  });

  it("returns bid_count entries with strictly decreasing amounts (no override)", () => {
    const h = buildBidHistory(base, undefined, 0);
    expect(h).toHaveLength(6);
    expect(h[0].amount).toBe(18000); // newest = current bid
    for (let i = 1; i < h.length; i++) expect(h[i].amount).toBeLessThan(h[i - 1].amount);
    expect(h.every((e) => !e.isYou)).toBe(true);
    expect(h[0].bidder).toMatch(/^Bidder ••\d{4}$/);
  });

  it("puts the user's bid on top labeled You and keeps the effective count", () => {
    const override = { amount: 19000, count: 7, at: 1000 };
    const h = buildBidHistory(base, override, 1000);
    expect(h).toHaveLength(7);
    expect(h[0]).toMatchObject({ amount: 19000, bidder: "You", isYou: true });
    expect(h[1].amount).toBeLessThan(19000);
  });

  it("is deterministic", () => {
    expect(buildBidHistory(base, undefined, 0)).toEqual(buildBidHistory(base, undefined, 0));
  });
});

describe("formatAgo", () => {
  it("formats sensibly", () => {
    expect(formatAgo(30)).toBe("30s ago");
    expect(formatAgo(150)).toBe("2m ago");
    expect(formatAgo(7200)).toBe("2h ago");
  });
});
