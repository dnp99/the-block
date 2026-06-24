import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

vi.mock("@/lib/auction", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auction")>();
  return { ...actual, auctionState: vi.fn() };
});

import { BidBar } from "@/components/bidding/BidBar";
import { auctionState, type AuctionState } from "@/lib/auction";

const NOW = 1_700_000_000_000;
const live: AuctionState = { phase: "live", startMs: NOW - 1000, endMs: NOW + 600_000 };
const ended: AuctionState = { phase: "ended", startMs: NOW - 100, endMs: NOW - 50 };

beforeEach(() => localStorage.clear());
afterEach(() => vi.clearAllMocks());

describe("BidBar", () => {
  it("live: shows the current bid and the bid form", () => {
    vi.mocked(auctionState).mockReturnValue(live);
    renderWithIntl(
      <BidBar vehicle={makeVehicle({ current_bid: 26300, bid_count: 12 })} anchorMs={NOW} />,
    );
    expect(screen.getByText(/Current bid/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Place bid" })).toBeInTheDocument();
  });

  it("ended: ended message, no bid form", () => {
    vi.mocked(auctionState).mockReturnValue(ended);
    renderWithIntl(<BidBar vehicle={makeVehicle({ current_bid: 26300 })} anchorMs={NOW} />);
    expect(screen.getByText("This auction has ended.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place bid" })).toBeNull();
  });
});
