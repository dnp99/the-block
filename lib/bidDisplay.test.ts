import { describe, expect, it } from "vitest";
import { bidDisplay } from "@/lib/bidDisplay";
import type { Vehicle } from "@/lib/contracts/vehicle";

const v = (over: Partial<Vehicle> = {}): Vehicle =>
  ({
    starting_bid: 10000,
    current_bid: null,
    bid_count: 0,
    reserve_price: 20000,
    buy_now_price: null,
    ...over,
  }) as Vehicle;

describe("bidDisplay — upcoming", () => {
  it("always shows the opening price, no bids, no actions (ignores dataset bids)", () => {
    const d = bidDisplay(v({ current_bid: 18000, bid_count: 9 }), "upcoming");
    expect(d).toMatchObject({
      label: "Starting bid",
      amount: 10000,
      showCount: false,
      showActions: false,
    });
  });
});

describe("bidDisplay — live", () => {
  it("no bids → starting bid, actions on, count hidden", () => {
    const d = bidDisplay(v(), "live");
    expect(d).toMatchObject({ label: "Starting bid", amount: 10000, showCount: false, showActions: true });
  });

  it("with bids → current bid + clickable count + actions", () => {
    const d = bidDisplay(v({ current_bid: 15000, bid_count: 4 }), "live");
    expect(d).toMatchObject({ label: "Current bid", amount: 15000, count: 4, showCount: true, showActions: true });
  });

  it("a local override wins and marks the viewer high bidder", () => {
    const d = bidDisplay(v({ current_bid: 15000, bid_count: 4 }), "live", { amount: 21000, count: 5, at: 0 });
    expect(d).toMatchObject({ label: "Current bid", amount: 21000, count: 5, isHighBidder: true, reserveMet: true });
  });
});

describe("bidDisplay — ended", () => {
  it("bids + reserve met → Sold for", () => {
    const d = bidDisplay(v({ current_bid: 25000, bid_count: 12 }), "ended");
    expect(d).toMatchObject({ label: "Sold for", amount: 25000, showCount: true, showActions: false, reserveMet: true });
  });

  it("bids + reserve not met → Final bid (no sale)", () => {
    const d = bidDisplay(v({ current_bid: 14000, bid_count: 6 }), "ended");
    expect(d).toMatchObject({ label: "Final bid", amount: 14000, showCount: true, showActions: false, reserveMet: false });
  });

  it("no bids → No bids, no count, no actions", () => {
    const d = bidDisplay(v(), "ended");
    expect(d).toMatchObject({ label: "No bids", showCount: false, showActions: false });
  });
});
