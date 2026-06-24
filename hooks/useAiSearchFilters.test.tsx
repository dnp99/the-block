import { act, renderHook, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/shared/Toaster";
import { useAiSearchFilters } from "@/hooks/useAiSearchFilters";
import { postJson } from "@/lib/api-client";
import en from "@/messages/en.json";

vi.mock("@/lib/api-client", () => ({
  postJson: vi.fn(),
}));

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <ToastProvider>{children}</ToastProvider>
    </NextIntlClientProvider>
  );
}

async function runTimer(ms: number) {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

describe("useAiSearchFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing for short queries", () => {
    const { result } = renderHook(() => useAiSearchFilters("ab"), { wrapper: Wrapper });
    expect(result.current.aiLoading).toBe(false);
    expect(result.current.aiFilters).toEqual({});
    expect(postJson).not.toHaveBeenCalled();
  });

  it("debounces, validates, and allows per-field removal", async () => {
    vi.mocked(postJson).mockResolvedValue({
      filters: { make: " Tesla ", price_max: 20000, junk: "x" },
    });

    const { result } = renderHook(() => useAiSearchFilters("tesla under 20k"), {
      wrapper: Wrapper,
    });

    expect(result.current.aiLoading).toBe(true);
    expect(result.current.aiFilters).toEqual({});

    await runTimer(600);

    expect(result.current.aiFilters).toEqual({ make: "Tesla", price_max: 20000 });
    expect(result.current.aiLoading).toBe(false);
    expect(postJson).toHaveBeenCalledWith("/api/search", { query: "tesla under 20k" });

    act(() => result.current.removeAiFilter("make"));
    expect(result.current.aiFilters).toEqual({ price_max: 20000 });
  });

  it("falls back to keyword filters and shows a toast on API failure", async () => {
    vi.mocked(postJson).mockRejectedValue(new Error("boom"));

    const { result } = renderHook(() => useAiSearchFilters("awd suv"), {
      wrapper: Wrapper,
    });

    await runTimer(600);

    expect(result.current.aiFilters).toEqual({ keywords: ["awd", "suv"] });
    expect(
      screen.getByText("AI search unavailable — using basic search"),
    ).toBeInTheDocument();
  });

  it("reuses cached query results without calling the API again", async () => {
    vi.mocked(postJson)
      .mockResolvedValueOnce({ filters: { make: "Tesla" } })
      .mockResolvedValueOnce({ filters: { body_style: "SUV" } });

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) => useAiSearchFilters(query),
      { initialProps: { query: "tesla" }, wrapper: Wrapper },
    );

    await runTimer(600);
    expect(result.current.aiFilters).toEqual({ make: "Tesla" });

    rerender({ query: "tesla suv" });
    await runTimer(600);
    expect(result.current.aiFilters).toEqual({ body_style: "SUV" });

    rerender({ query: "tesla" });
    expect(result.current.aiLoading).toBe(true);
    await runTimer(0);
    expect(result.current.aiFilters).toEqual({ make: "Tesla" });

    expect(postJson).toHaveBeenCalledTimes(2);
  });
});
