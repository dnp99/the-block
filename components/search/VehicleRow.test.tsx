import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleRow } from "@/components/search/VehicleRow";
import type { AuctionState } from "@/lib/auction";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

const NOW = 1_700_000_000_000;
const live: AuctionState = { phase: "live", startMs: NOW - 1000, endMs: NOW + 600_000 };
const ended: AuctionState = { phase: "ended", startMs: NOW - 100, endMs: NOW - 50 };

// The bid block renders twice (desktop + mobile, one hidden via CSS), so several
// labels legitimately appear more than once.
describe("VehicleRow", () => {
  it("shows title, current bid and quick actions when live", () => {
    renderWithIntl(<VehicleRow vehicle={makeVehicle()} state={live} nowMs={NOW} />);
    expect(screen.getByText("Tacoma")).toBeInTheDocument();
    expect(screen.getAllByText(/Current bid/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("$26,300").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Place a bid").length).toBeGreaterThan(0);
  });

  it("reads as a sold outcome with no actions when ended (reserve met)", () => {
    renderWithIntl(
      <VehicleRow vehicle={makeVehicle({ current_bid: 26300, reserve_price: 20000 })} state={ended} nowMs={NOW} />,
    );
    expect(screen.getAllByText(/Sold for/).length).toBeGreaterThan(0);
    expect(screen.queryByText("Place a bid")).toBeNull();
  });
});
