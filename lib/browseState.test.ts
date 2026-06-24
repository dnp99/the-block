import { beforeEach, describe, expect, it } from "vitest";
import {
  BROWSE_STATE_KEY,
  clearBrowseState,
  loadBrowseState,
  saveBrowseState,
  type BrowseState,
} from "@/lib/browseState";

const sample: BrowseState = {
  tab: "live",
  query: "suv",
  make: "Toyota",
  bodyStyle: "",
  province: "Ontario",
  conditionMin: "4",
  yearRange: [2018, 2025],
  odoRange: [0, 30000],
  priceRange: [0, 50000],
  sort: "ending",
  aiFilters: { body_style: "SUV", price_max: 50000 },
};

describe("browseState", () => {
  beforeEach(() => sessionStorage.clear());

  it("returns null when nothing is stored", () => {
    expect(loadBrowseState()).toBeNull();
  });

  it("round-trips a saved snapshot", () => {
    saveBrowseState(sample);
    expect(loadBrowseState()).toEqual(sample);
  });

  it("clears the stored snapshot", () => {
    saveBrowseState(sample);
    clearBrowseState();
    expect(loadBrowseState()).toBeNull();
  });

  it("returns null on malformed JSON instead of throwing", () => {
    sessionStorage.setItem(BROWSE_STATE_KEY, "{not json");
    expect(loadBrowseState()).toBeNull();
  });
});
