import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecGrid } from "@/components/views/vehicle/SpecGrid";
import { makeVehicle } from "@/test/fixtures";

describe("SpecGrid", () => {
  it("renders the spec fields and values", () => {
    render(
      <SpecGrid vehicle={makeVehicle({ engine: "2.4L turbo I4", odometer_km: 23495, lot: "A-0009" })} />,
    );
    expect(screen.getByText("Specifications")).toBeInTheDocument();
    expect(screen.getByText("Engine")).toBeInTheDocument();
    expect(screen.getByText("2.4L turbo I4")).toBeInTheDocument();
    expect(screen.getByText("23,495 km")).toBeInTheDocument();
    expect(screen.getByText("A-0009")).toBeInTheDocument();
  });
});
