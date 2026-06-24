import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BidHistoryButton } from "@/components/vehicle/BidHistoryButton";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

const NOW = 1_700_000_000_000;

describe("BidHistoryButton", () => {
  it("shows 'No bids yet' (no trigger) when there are no bids", () => {
    renderWithIntl(
      <BidHistoryButton vehicle={makeVehicle()} count={0} override={undefined} nowMs={NOW} />,
    );
    expect(screen.getByText("No bids yet")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("opens a modal with reconstructed, masked history", () => {
    const v = makeVehicle({ current_bid: 26300, bid_count: 12, starting_bid: 14500 });
    renderWithIntl(<BidHistoryButton vehicle={v} count={12} override={undefined} nowMs={NOW} />);
    fireEvent.click(screen.getByRole("button", { name: /12 bids/ }));
    expect(screen.getByText("Bid history")).toBeInTheDocument();
    expect(screen.getByText(/identities are masked/i)).toBeInTheDocument();
  });
});
