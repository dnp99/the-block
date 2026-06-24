import { afterEach, describe, expect, it, vi } from "vitest";
import { isWithinRateLimit } from "@/server/rateLimit";

afterEach(() => vi.useRealTimers());

describe("isWithinRateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = "limit-test";
    expect(isWithinRateLimit(key, 3)).toBe(true);
    expect(isWithinRateLimit(key, 3)).toBe(true);
    expect(isWithinRateLimit(key, 3)).toBe(true);
    expect(isWithinRateLimit(key, 3)).toBe(false);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const key = "window-test";
    expect(isWithinRateLimit(key, 1, 1000)).toBe(true);
    expect(isWithinRateLimit(key, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(isWithinRateLimit(key, 1, 1000)).toBe(true);
  });
});
