import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VinCopy } from "@/components/shared/VinCopy";

describe("VinCopy", () => {
  it("copies the VIN and shows a copied state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    render(<VinCopy vin="1HGCM82633A004352" />);
    expect(screen.getByText("1HGCM82633A004352")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith("1HGCM82633A004352");
    await waitFor(() => expect(screen.getByTitle("Copied")).toBeInTheDocument());
  });
});
