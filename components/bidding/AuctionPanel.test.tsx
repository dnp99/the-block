import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

vi.mock("@/lib/auction", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auction")>();
  return { ...actual, auctionState: vi.fn() };
});

import { AuctionPanel } from "@/components/bidding/AuctionPanel";
import { auctionState, type AuctionState } from "@/lib/auction";

const NOW = 1_700_000_000_000;
const live: AuctionState = { phase: "live", startMs: NOW - 1000, endMs: NOW + 600_000 };
const ended: AuctionState = { phase: "ended", startMs: NOW - 100, endMs: NOW - 50 };
const upcoming: AuctionState = { phase: "upcoming", startMs: NOW + 600_000, endMs: NOW + 600_001 };

beforeEach(() => localStorage.clear());
afterEach(() => vi.clearAllMocks());

describe("AuctionPanel", () => {
  it("live: shows current bid and the bid form", () => {
    vi.mocked(auctionState).mockReturnValue(live);
    renderWithIntl(
      <AuctionPanel vehicle={makeVehicle({ current_bid: 26300, bid_count: 12 })} anchorMs={NOW} />,
    );
    expect(screen.getByText("Current bid")).toBeInTheDocument();
    expect(screen.getByText("$26,300")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Place bid" })).toBeInTheDocument();
  });

  it("ended: 'Sold for' + ended message, no bid form", () => {
    vi.mocked(auctionState).mockReturnValue(ended);
    renderWithIntl(
      <AuctionPanel vehicle={makeVehicle({ current_bid: 26300, reserve_price: 20000 })} anchorMs={NOW} />,
    );
    expect(screen.getByText("Sold for")).toBeInTheDocument();
    expect(screen.getByText("This auction has ended.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place bid" })).toBeNull();
  });

  it("upcoming: starting bid + 'bidding opens' message", () => {
    vi.mocked(auctionState).mockReturnValue(upcoming);
    renderWithIntl(<AuctionPanel vehicle={makeVehicle({ starting_bid: 14500 })} anchorMs={NOW} />);
    // "Starting bid" appears as both the bid label and the bottom starting-bid row.
    expect(screen.getAllByText("Starting bid").length).toBeGreaterThan(0);
    expect(screen.getByText("Bidding opens when the auction goes live.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Place bid" })).toBeNull();
  });
});
