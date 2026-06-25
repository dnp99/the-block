import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchView } from "@/components/views/browse/SearchView";
import { VehicleDetail } from "@/components/views/vehicle/VehicleDetail";
import { getAllVehicles } from "@/lib/data/vehicles";
import { renderWithIntl } from "@/test/intl";

vi.mock("@/lib/api-client", () => ({ postJson: vi.fn(() => new Promise(() => {})) }));

const NOW = 1_700_000_000_000;
const vehicles = getAllVehicles();

describe("smoke: pages render end-to-end against the real dataset", () => {
  it("the real 200-vehicle dataset loads and validates", () => {
    expect(vehicles.length).toBeGreaterThan(100);
  });

  it("browse (SearchView) mounts and renders rows from real data — no crash", () => {
    const slice = vehicles.slice(0, 12);
    renderWithIntl(<SearchView vehicles={slice} auctionNowMs={NOW} />);

    expect(screen.getByRole("heading", { name: "Browse inventory" })).toBeInTheDocument();
    expect(
      screen.getByText(`${slice.length} vehicles up for auction across Canada.`),
    ).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Auction status" })).toBeInTheDocument();
    expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
  });

  it("vehicle detail (VehicleDetail) mounts and renders the vehicle — no crash", () => {
    const v = vehicles[0];
    renderWithIntl(<VehicleDetail vehicle={v} auctionNowMs={NOW} />);

    expect(screen.getByRole("link", { name: /Back to browse/ })).toBeInTheDocument();
    expect(screen.getByText("Specifications")).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(v.make)).length).toBeGreaterThan(0);
  });
});
