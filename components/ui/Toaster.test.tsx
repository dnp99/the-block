import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/ui/Toaster";

function Trigger() {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast("Saved", "success")}>
      fire
    </button>
  );
}

describe("Toaster", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("shows a tone-coloured toast and auto-dismisses after 4s", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("fire"));

    const toast = screen.getByText("Saved");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass("text-success");

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("throws if used outside the provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Trigger />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
