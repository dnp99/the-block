import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { QuickBid } from "@/components/bidding/QuickBid";
import { readBids } from "@/lib/bids";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

beforeEach(() => localStorage.clear());

describe("QuickBid", () => {
  it("requires a confirm tap before placing the minimum next bid", () => {
    const v = makeVehicle({ id: "q1", current_bid: 16500, bid_count: 5 });
    renderWithIntl(<QuickBid vehicle={v} />);
    const btn = screen.getByRole("button");

    fireEvent.click(btn); // first tap → confirm step, nothing placed yet
    expect(readBids()["q1"]).toBeUndefined();

    fireEvent.click(btn); // second tap → places current + $100 increment
    expect(readBids()["q1"]?.amount).toBe(16600);
  });
});
