import { afterEach, describe, expect, it, vi } from "vitest";
import { rateLimit } from "@/server/rateLimit";

afterEach(() => vi.useRealTimers());

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = "limit-test";
    expect(rateLimit(key, 3)).toBe(true);
    expect(rateLimit(key, 3)).toBe(true);
    expect(rateLimit(key, 3)).toBe(true);
    expect(rateLimit(key, 3)).toBe(false);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const key = "window-test";
    expect(rateLimit(key, 1, 1000)).toBe(true);
    expect(rateLimit(key, 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000)).toBe(true);
  });
});
