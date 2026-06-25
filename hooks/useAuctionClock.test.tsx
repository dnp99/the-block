import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuctionClock } from "@/hooks/useAuctionClock";

const REAL_NOW = 1_700_000_000_000;
const DAY = 24 * 60 * 60_000;

describe("useAuctionClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(REAL_NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("re-anchors to the client clock on mount, ignoring a stale server timestamp", () => {
    const stale = REAL_NOW - 3 * DAY;
    const { result } = renderHook(() => useAuctionClock(stale));

    expect(result.current.anchorMs).toBe(REAL_NOW);
    expect(result.current.nowMs).toBe(REAL_NOW);
    expect(result.current.anchorMs).not.toBe(stale);
  });

  it("ticks nowMs forward while keeping anchorMs frozen", () => {
    const { result } = renderHook(() => useAuctionClock(REAL_NOW));
    const anchor = result.current.anchorMs;

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.nowMs).toBe(REAL_NOW + 5000);
    expect(result.current.anchorMs).toBe(anchor);
  });
});
