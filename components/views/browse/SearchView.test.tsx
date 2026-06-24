import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchView } from "@/components/views/browse/SearchView";
import { auctionState, type AuctionPhase, type AuctionState } from "@/lib/auction";
import { BROWSE_RESET_EVENT, clearBrowseState } from "@/lib/browseState";
import { postJson } from "@/lib/api-client";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

vi.mock("@/lib/api-client", () => ({ postJson: vi.fn() }));

// Deterministic auction phases per id; auctionStartMs gives a stable sort order.
vi.mock("@/lib/auction", () => ({
  auctionState: vi.fn(),
  auctionStartMs: (id: string) => id.charCodeAt(id.length - 1),
}));

// Stub the results list to expose which vehicle ids render (jsdom can't lay out the real rows).
vi.mock("@/components/views/browse/VehicleList", () => ({
  VehicleList: ({ items }: { items: { vehicle: { id: string } }[] }) => (
    <ul data-testid="results">
      {items.map((i) => (
        <li key={i.vehicle.id}>{i.vehicle.id}</li>
      ))}
    </ul>
  ),
}));

// Stub the filter rail (Radix slider trips jsdom CSS) but expose its callbacks as buttons.
vi.mock("@/components/views/browse/FilterPanel", () => ({
  FilterPanel: (props: {
    onMake: (v: string) => void;
    onYearRange: (r: [number, number]) => void;
    onClearAll: () => void;
  }) => (
    <div data-testid="filter-panel">
      <button onClick={() => props.onMake("Toyota")}>set-make</button>
      <button onClick={() => props.onYearRange([2020, 2024])}>narrow-year</button>
      <button onClick={() => props.onClearAll()}>panel-clear</button>
    </div>
  ),
}));

const NOW = 1_700_000_000_000;
let phaseMap: Record<string, AuctionPhase> = {};

function stateFor(phase: AuctionPhase): AuctionState {
  if (phase === "live") return { phase, startMs: NOW - 1000, endMs: NOW + 1000 };
  if (phase === "upcoming") return { phase, startMs: NOW + 1000, endMs: NOW + 2000 };
  return { phase, startMs: NOW - 2000, endMs: NOW - 1000 };
}

const vehicles = [
  makeVehicle({ id: "v1", make: "Toyota", body_style: "SUV", year: 2025 }),
  makeVehicle({ id: "v2", make: "Honda", body_style: "SUV", year: 2021 }),
  makeVehicle({ id: "v3", make: "Ford", body_style: "truck", year: 2018 }),
];

async function runTimer(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

const render = () => renderWithIntl(<SearchView vehicles={vehicles} auctionNowMs={NOW} />);
const shownIds = () =>
  within(screen.getByTestId("results"))
    .queryAllByRole("listitem")
    .map((li) => li.textContent);
const tab = (name: RegExp) => screen.getByRole("tab", { name });
const searchBox = () => screen.getByRole("searchbox") as HTMLInputElement;

describe("SearchView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    phaseMap = {};
    vi.mocked(auctionState).mockImplementation((id: string) => stateFor(phaseMap[id] ?? "live"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the heading and a vehicle count subtitle", () => {
    render();
    expect(screen.getByRole("heading", { name: "Browse inventory" })).toBeInTheDocument();
    expect(
      screen.getByText("3 vehicles up for auction across Canada."),
    ).toBeInTheDocument();
  });

  it("counts vehicles per phase and filters the list by the active tab", () => {
    phaseMap = { v1: "live", v2: "upcoming", v3: "ended" };
    render();

    expect(within(tab(/All/)).getByText("3")).toBeInTheDocument();
    expect(within(tab(/Live/)).getByText("1")).toBeInTheDocument();
    expect(within(tab(/Upcoming/)).getByText("1")).toBeInTheDocument();
    expect(within(tab(/Ended/)).getByText("1")).toBeInTheDocument();

    expect(shownIds()).toEqual(["v1", "v2", "v3"]);

    fireEvent.click(tab(/Upcoming/));
    expect(shownIds()).toEqual(["v2"]);
  });

  it("applies a manual filter as a removable chip and narrows results", () => {
    render();
    expect(shownIds()).toEqual(["v1", "v2", "v3"]);

    fireEvent.click(screen.getByText("set-make"));
    expect(screen.getByRole("button", { name: "Remove filter Toyota" })).toBeInTheDocument();
    expect(shownIds()).toEqual(["v1"]);
    expect(within(tab(/All/)).getByText("1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove filter Toyota" }));
    expect(shownIds()).toEqual(["v1", "v2", "v3"]);
  });

  it("shows a removable range chip when a slider range is narrowed", () => {
    render();
    fireEvent.click(screen.getByText("narrow-year"));
    expect(screen.getByRole("button", { name: "Remove filter 2020–2024" })).toBeInTheDocument();
    expect(shownIds()).toEqual(["v2"]);

    fireEvent.click(screen.getByRole("button", { name: "Remove filter 2020–2024" }));
    expect(shownIds()).toEqual(["v1", "v2", "v3"]);
  });

  it("toggles the mobile filter panel on demand", () => {
    render();
    expect(screen.getAllByTestId("filter-panel")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    expect(screen.getAllByTestId("filter-panel")).toHaveLength(2);
  });

  it("restores saved filters on remount (Back to browse / reload)", () => {
    const first = render();
    fireEvent.click(screen.getByText("set-make"));
    expect(shownIds()).toEqual(["v1"]);
    first.unmount();

    render();
    expect(screen.getByRole("button", { name: "Remove filter Toyota" })).toBeInTheDocument();
    expect(shownIds()).toEqual(["v1"]);
  });

  it("persists the active tab across remount (Back to browse / reload)", () => {
    phaseMap = { v1: "live", v2: "upcoming", v3: "ended" };
    const first = render();
    fireEvent.click(tab(/Upcoming/));
    expect(shownIds()).toEqual(["v2"]);
    first.unmount();

    render();
    expect(tab(/Upcoming/).getAttribute("aria-selected")).toBe("true");
    expect(shownIds()).toEqual(["v2"]);
  });

  it("resets the live view AND returns to the All tab when a browse-reset is broadcast (logo)", () => {
    phaseMap = { v1: "live", v2: "upcoming", v3: "ended" };
    render();
    fireEvent.click(tab(/Live/));
    fireEvent.click(screen.getByText("set-make"));
    expect(shownIds()).toEqual(["v1"]);

    act(() => {
      window.dispatchEvent(new Event(BROWSE_RESET_EVENT));
    });

    expect(tab(/All/).getAttribute("aria-selected")).toBe("true");
    expect(screen.queryByRole("button", { name: "Remove filter Toyota" })).toBeNull();
    expect(shownIds()).toEqual(["v1", "v2", "v3"]);
  });

  it("starts fresh when the saved state was cleared (header logo)", () => {
    const first = render();
    fireEvent.click(screen.getByText("set-make"));
    first.unmount();

    clearBrowseState();
    render();
    expect(screen.queryByRole("button", { name: "Remove filter Toyota" })).toBeNull();
    expect(shownIds()).toEqual(["v1", "v2", "v3"]);
  });

  it("paginates a long result list with Load more", () => {
    const many = Array.from({ length: 30 }, (_, i) => makeVehicle({ id: `m${i}` }));
    renderWithIntl(<SearchView vehicles={many} auctionNowMs={NOW} />);
    expect(shownIds()).toHaveLength(24);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(shownIds()).toHaveLength(30);
  });

  it("Clear all resets the search text, manual filters and AI filters", async () => {
    vi.mocked(postJson).mockResolvedValue({ filters: { body_style: "SUV" } });
    render();

    fireEvent.click(screen.getByText("set-make"));
    fireEvent.change(searchBox(), { target: { value: "suv" } });
    await runTimer(600);

    expect(screen.getByRole("button", { name: "Remove filter Toyota" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove filter ✨ SUV" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(searchBox().value).toBe("");
    expect(screen.queryByRole("button", { name: /Remove filter/ })).toBeNull();
    expect(shownIds()).toEqual(["v1", "v2", "v3"]);
  });

  it("falls back to a keyword chip and shows a toast when the AI call fails", async () => {
    vi.mocked(postJson).mockRejectedValue(new Error("boom"));
    render();

    fireEvent.change(searchBox(), { target: { value: "awd suv" } });
    await runTimer(600);

    expect(screen.getByRole("button", { name: /Remove filter ✨.*awd suv/ })).toBeInTheDocument();
    expect(
      screen.getByText("AI search unavailable — using basic search"),
    ).toBeInTheDocument();
  });

  it("keeps the search text while AI chips remain and clears it when the last is removed", async () => {
    vi.mocked(postJson).mockResolvedValue({
      filters: { body_style: "SUV", price_max: 50000 },
    });
    render();

    fireEvent.change(searchBox(), { target: { value: "SUV under 50k" } });
    await runTimer(600);

    const suvChip = screen.getByRole("button", { name: "Remove filter ✨ SUV" });
    expect(
      screen.getByRole("button", { name: "Remove filter ✨ ≤ $50,000" }),
    ).toBeInTheDocument();

    // Removing one of two chips refines but leaves the search text intact.
    fireEvent.click(suvChip);
    expect(searchBox().value).toBe("SUV under 50k");
    const priceChip = screen.getByRole("button", { name: "Remove filter ✨ ≤ $50,000" });

    // Removing the last AI chip clears the search text too (symmetry with Clear all).
    fireEvent.click(priceChip);
    expect(searchBox().value).toBe("");
    expect(screen.queryByRole("button", { name: /Remove filter ✨/ })).toBeNull();
  });
});
