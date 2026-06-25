import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVehicleSearch } from "@/hooks/useVehicleSearch";
import { auctionState, type AuctionPhase, type AuctionState } from "@/lib/auction";
import { postJson } from "@/lib/api-client";
import { makeVehicle } from "@/test/fixtures";
import { renderHookWithIntl } from "@/test/intl";

vi.mock("@/lib/api-client", () => ({ postJson: vi.fn() }));

vi.mock("@/lib/auction", () => ({
  auctionState: vi.fn(),
  auctionStartMs: (id: string) => id.charCodeAt(id.length - 1),
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

const render = () => renderHookWithIntl(() => useVehicleSearch(vehicles, NOW));
const ids = (results: { vehicle: { id: string } }[]) => results.map((r) => r.vehicle.id);
const labels = (chips: { label: string }[]) => chips.map((c) => c.label);

describe("useVehicleSearch", () => {
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

  it("derives per-phase counts and tab-filtered results", () => {
    phaseMap = { v1: "live", v2: "upcoming", v3: "ended" };
    const { result } = render();

    expect(result.current.counts).toEqual({ all: 3, live: 1, upcoming: 1, ended: 1 });
    expect(ids(result.current.results)).toEqual(["v1", "v2", "v3"]);

    act(() => result.current.setTab("upcoming"));
    expect(ids(result.current.results)).toEqual(["v2"]);
  });

  it("narrows results and exposes a removable chip for a manual filter, then reset() clears it", () => {
    const { result } = render();
    expect(ids(result.current.results)).toEqual(["v1", "v2", "v3"]);

    act(() => result.current.filterPanelProps.onMake("Toyota"));
    expect(ids(result.current.results)).toEqual(["v1"]);
    expect(labels(result.current.chips)).toContain("Toyota");

    act(() => result.current.reset());
    expect(ids(result.current.results)).toEqual(["v1", "v2", "v3"]);
    expect(result.current.chips).toHaveLength(0);
  });

  it("reflects AI filters in filterPanelProps and takes ownership when a control is edited", async () => {
    vi.mocked(postJson).mockResolvedValue({ filters: { body_style: "SUV", price_max: 20000 } });
    const { result } = render();

    act(() => result.current.setQuery("suv under 20k"));
    await runTimer(600);

    expect(result.current.filterPanelProps.bodyStyle).toBe("SUV");
    expect(labels(result.current.chips)).toEqual(
      expect.arrayContaining(["✨ SUV", "✨ ≤ $20,000"]),
    );

    act(() => result.current.filterPanelProps.onBodyStyle("coupe"));

    expect(result.current.filterPanelProps.bodyStyle).toBe("coupe");
    expect(labels(result.current.chips)).toContain("coupe");
    expect(labels(result.current.chips)).not.toContain("✨ SUV");
    expect(labels(result.current.chips)).toContain("✨ ≤ $20,000");
  });
});
