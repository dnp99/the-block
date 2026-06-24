import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { BrandLink } from "@/components/layout/BrandLink";
import { BROWSE_STATE_KEY } from "@/lib/browseState";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
  }: {
    children: ReactNode;
    href: string;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe("BrandLink", () => {
  it("clears the saved browse state when the logo is clicked", () => {
    sessionStorage.setItem(BROWSE_STATE_KEY, JSON.stringify({ make: "Toyota" }));
    render(<BrandLink />);

    fireEvent.click(screen.getByRole("link", { name: /Openlane/ }));

    expect(sessionStorage.getItem(BROWSE_STATE_KEY)).toBeNull();
  });
});
