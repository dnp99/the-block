import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleImage } from "@/components/shared/VehicleImage";

describe("VehicleImage", () => {
  it("renders a branded fallback when there is no src", () => {
    render(<VehicleImage src={undefined} alt="2025 Toyota Tacoma" />);
    expect(screen.getByText("2025 Toyota Tacoma")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("swaps to the fallback tile when the image errors", () => {
    render(<VehicleImage src="https://placehold.co/800x600" alt="2025 Toyota Tacoma" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("2025 Toyota Tacoma")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
