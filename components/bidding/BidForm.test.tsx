import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { BidForm } from "@/components/bidding/BidForm";
import { readBids } from "@/lib/bids";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

beforeEach(() => localStorage.clear());

describe("BidForm", () => {
  it("places a valid bid (defaults to the minimum) and persists it", () => {
    const v = makeVehicle({ id: "x1", current_bid: 16500, bid_count: 5 });
    renderWithIntl(<BidForm vehicle={v} />);

    fireEvent.click(screen.getByRole("button", { name: "Place bid" }));
    expect(readBids()["x1"]?.amount).toBe(16600);
  });

  it("rejects a bid below the minimum with an inline error and no write", () => {
    const v = makeVehicle({ id: "x2", current_bid: 16500, bid_count: 5 });
    renderWithIntl(<BidForm vehicle={v} />);
    fireEvent.change(screen.getByLabelText("Your bid amount"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Place bid" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Enter at least/);
    expect(readBids()["x2"]).toBeUndefined();
  });
});
