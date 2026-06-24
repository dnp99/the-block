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

export function loadBrowseState(): BrowseState | null {
  try {
    const raw = sessionStorage.getItem(BROWSE_STATE_KEY);
    return raw ? (JSON.parse(raw) as BrowseState) : null;
  } catch {
    return null;
  }
}

export function saveBrowseState(state: BrowseState): void {
  try {
    sessionStorage.setItem(BROWSE_STATE_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable (private mode / SSR) — persistence is best-effort.
  }
}

export function clearBrowseState(): void {
  try {
    sessionStorage.removeItem(BROWSE_STATE_KEY);
  } catch {
    // no-op
  }
}

// Logo click: clear the store and tell a mounted browse view to reset (same-route navigation
// doesn't remount it).
export function resetBrowse(): void {
  clearBrowseState();
  try {
    window.dispatchEvent(new Event(BROWSE_RESET_EVENT));
  } catch {
    // no-op
  }
}
