import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DealerBlock } from "@/components/views/vehicle/DealerBlock";
import { makeVehicle } from "@/test/fixtures";

describe("DealerBlock", () => {
  it("renders the dealership, location and initial", () => {
    render(
      <DealerBlock
        vehicle={makeVehicle({
          selling_dealership: "Golden Horseshoe Motors",
          city: "Hamilton",
          province: "Ontario",
        })}
      />,
    );
    expect(screen.getByText("Selling dealership")).toBeInTheDocument();
    expect(screen.getByText("Golden Horseshoe Motors")).toBeInTheDocument();
    expect(screen.getByText("Hamilton, Ontario")).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
  });
});
