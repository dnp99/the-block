import { beforeEach, describe, expect, it } from "vitest";
import { BID_INCREMENT, minimumBid, placeBid, readBids } from "@/lib/bids";
import { parseBidStore } from "@/lib/contracts/bid";

beforeEach(() => localStorage.clear());

describe("minimumBid", () => {
  it("is the starting bid when there are no bids", () => {
    expect(minimumBid({ current_bid: null, starting_bid: 5000 })).toBe(5000);
  });

  it("is current bid + increment when bids exist", () => {
    expect(minimumBid({ current_bid: 22800, starting_bid: 14500 })).toBe(22800 + BID_INCREMENT);
  });

  it("uses the override amount when present", () => {
    const override = { amount: 30000, count: 5, at: 0 };
    expect(minimumBid({ current_bid: 22800, starting_bid: 14500 }, override)).toBe(30000 + BID_INCREMENT);
  });
});

describe("placeBid", () => {
  it("persists and increments the count over the base", () => {
    const a = placeBid("v1", 25000, 16);
    expect(a).toMatchObject({ amount: 25000, count: 17 });
    expect(readBids()["v1"].amount).toBe(25000);
  });

  it("increments again on a second bid", () => {
    placeBid("v1", 25000, 16);
    const b = placeBid("v1", 25100, 16);
    expect(b.count).toBe(18);
    expect(b.amount).toBe(25100);
  });
});

describe("parseBidStore", () => {
  it("drops malformed entries and bad JSON", () => {
    expect(parseBidStore("not json")).toEqual({});
    expect(parseBidStore(JSON.stringify({ ok: { amount: 1, count: 1, at: 0 }, bad: { amount: "x" } }))).toEqual({
      ok: { amount: 1, count: 1, at: 0 },
    });
  });
});
