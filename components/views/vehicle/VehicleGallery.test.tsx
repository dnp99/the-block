import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleGallery } from "@/components/views/vehicle/VehicleGallery";

const images = ["a.jpg", "b.jpg", "c.jpg"];

describe("VehicleGallery", () => {
  it("steps through photos and updates the counter", () => {
    render(<VehicleGallery images={images} alt="2025 Tacoma" />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("jumps to a thumbnail", () => {
    render(<VehicleGallery images={images} alt="2025 Tacoma" />);
    fireEvent.click(screen.getByRole("button", { name: "View photo 3" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });
});
