import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toolbar } from "@/components/views/browse/Toolbar";
import { renderWithIntl } from "@/test/intl";

function setup() {
  const props = {
    query: "",
    onQuery: vi.fn(),
    sort: "ending" as const,
    onSort: vi.fn(),
    resultCount: 80,
    totalCount: 200,
    activeFilterCount: 0,
    onToggleFilters: vi.fn(),
  };
  renderWithIntl(<Toolbar {...props} />);
  return props;
}

describe("Toolbar", () => {
  it("shows the result count and wires search, sort and filters", () => {
    const props = setup();
    expect(screen.getByText("80")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "tacoma" } });
    expect(props.onQuery).toHaveBeenCalledWith("tacoma");

    fireEvent.change(screen.getByLabelText("Sort by"), { target: { value: "make" } });
    expect(props.onSort).toHaveBeenCalledWith("make");

    fireEvent.click(screen.getByRole("button", { name: /Filters/ }));
    expect(props.onToggleFilters).toHaveBeenCalledOnce();
  });
});
