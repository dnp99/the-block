import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterChips } from "@/components/views/browse/FilterChips";
import { renderWithIntl } from "@/test/intl";

describe("FilterChips", () => {
  it("renders no chips/buttons when the list is empty", () => {
    renderWithIntl(<FilterChips chips={[]} onClearAll={() => {}} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders chips and fires remove + clear-all", () => {
    const onRemove = vi.fn();
    const onClearAll = vi.fn();
    renderWithIntl(
      <FilterChips chips={[{ key: "make", label: "BMW", onRemove }]} onClearAll={onClearAll} />,
    );
    expect(screen.getByText("BMW")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Remove filter BMW/ }));
    expect(onRemove).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: /^Clear all$/ }));
    expect(onClearAll).toHaveBeenCalledOnce();
  });
});
