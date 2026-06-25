import type { AuctionPhase } from "@/lib/auction";
import type { SearchFilters } from "@/lib/contracts/search";
import type { SortKey } from "@/lib/filters";

export const BROWSE_STATE_KEY = "tb-browse-state";
export const BROWSE_RESET_EVENT = "tb:browse-reset";

type Range = [number, number];

export interface BrowseState {
  tab: "all" | AuctionPhase;
  query: string;
  make: string;
  bodyStyle: string;
  province: string;
  conditionMin: string;
  yearRange: Range;
  odoRange: Range;
  priceRange: Range;
  sort: SortKey;
  aiFilters: SearchFilters;
}

const bestEffort = (action: () => void): void => {
  try {
    action();
  } catch {}
};

export function loadBrowseState(): BrowseState | null {
  try {
    const raw = sessionStorage.getItem(BROWSE_STATE_KEY);
    return raw ? (JSON.parse(raw) as BrowseState) : null;
  } catch {
    return null;
  }
}

export function saveBrowseState(state: BrowseState): void {
  bestEffort(() => sessionStorage.setItem(BROWSE_STATE_KEY, JSON.stringify(state)));
}

export function clearBrowseState(): void {
  bestEffort(() => sessionStorage.removeItem(BROWSE_STATE_KEY));
}

export function resetBrowse(): void {
  clearBrowseState();
  bestEffort(() => window.dispatchEvent(new Event(BROWSE_RESET_EVENT)));
}
