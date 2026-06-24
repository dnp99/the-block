import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterPanel, type FilterPanelProps } from "@/components/views/browse/FilterPanel";
import { renderWithIntl } from "@/test/intl";

function makeProps(over: Partial<FilterPanelProps> = {}): FilterPanelProps {
  return {
    make: "",
    onMake: vi.fn(),
    bodyStyle: "",
    onBodyStyle: vi.fn(),
    province: "",
    onProvince: vi.fn(),
    conditionMin: "",
    onConditionMin: vi.fn(),
    makeOptions: ["BMW", "Toyota"],
    bodyStyleOptions: ["SUV", "truck"],
    provinceOptions: ["Ontario"],
    yearBounds: [1990, 2025],
    yearRange: [1990, 2025],
    onYearRange: vi.fn(),
    odoBounds: [0, 200000],
    odoRange: [0, 200000],
    onOdoRange: vi.fn(),
    priceBounds: [0, 80000],
    priceRange: [0, 80000],
    onPriceRange: vi.fn(),
    hasActiveFilters: false,
    onClearAll: vi.fn(),
    ...over,
  };
}

describe("FilterPanel", () => {
  it("fires the make filter on change", () => {
    const props = makeProps();
    renderWithIntl(<FilterPanel {...props} />);
    fireEvent.change(screen.getByLabelText("Make"), { target: { value: "BMW" } });
    expect(props.onMake).toHaveBeenCalledWith("BMW");
  });

  it("shows Clear all only with active filters and fires it", () => {
    const inactive = makeProps();
    const { unmount } = renderWithIntl(<FilterPanel {...inactive} />);
    expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();
    unmount();

    const active = makeProps({ hasActiveFilters: true });
    renderWithIntl(<FilterPanel {...active} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(active.onClearAll).toHaveBeenCalledOnce();
  });
});
