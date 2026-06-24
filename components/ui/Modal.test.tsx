import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "@/components/ui/Modal";

describe("Modal", () => {
  it("renders title + content when open and closes via the button", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Bid history">
        <p>Body content</p>
      </Modal>,
    );
    expect(screen.getByText("Bid history")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
