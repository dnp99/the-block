import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pill } from "@/components/ui/Pill";

describe("Pill", () => {
  it("uses a soft fill by default", () => {
    render(<Pill tone="green">Reserve met</Pill>);
    expect(screen.getByText("Reserve met")).toHaveClass("bg-success-soft");
  });

  it("uses a bordered surface for the outline variant", () => {
    render(
      <Pill tone="red" variant="outline">
        Salvage title
      </Pill>,
    );
    const el = screen.getByText("Salvage title");
    expect(el).toHaveClass("border", "bg-surface", "text-error");
    expect(el).not.toHaveClass("bg-error-soft");
  });
});
