import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuctionTabs } from "@/components/views/browse/AuctionTabs";
import { renderWithIntl } from "@/test/intl";

const counts = { all: 200, live: 80, upcoming: 76, ended: 44 };

describe("AuctionTabs", () => {
  it("translates labels, shows counts, and marks the active tab", () => {
    renderWithIntl(<AuctionTabs value="live" onChange={() => {}} counts={counts} />);
    expect(screen.getByRole("tab", { name: /Live/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /All/ })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("80")).toBeInTheDocument();
  });

  it("calls onChange with the tab key", () => {
    const onChange = vi.fn();
    renderWithIntl(<AuctionTabs value="all" onChange={onChange} counts={counts} />);
    fireEvent.click(screen.getByRole("tab", { name: /Ended/ }));
    expect(onChange).toHaveBeenCalledWith("ended");
  });

  it("renders French labels", () => {
    renderWithIntl(<AuctionTabs value="all" onChange={() => {}} counts={counts} />, "fr");
    expect(screen.getByRole("tab", { name: /À venir/ })).toBeInTheDocument();
  });
});
