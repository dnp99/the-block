import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithIntl } from "@/test/intl";

vi.mock("@/lib/api-client", () => ({ postJson: vi.fn() }));

import { ConditionSummary } from "@/components/vehicle/ConditionSummary";
import { postJson } from "@/lib/api-client";

afterEach(() => vi.clearAllMocks());

describe("ConditionSummary", () => {
  it("renders the AI summary after loading", async () => {
    vi.mocked(postJson).mockResolvedValue({ summary: "Solid daily driver." });
    renderWithIntl(<ConditionSummary id="cs-success" />);
    await waitFor(() => expect(screen.getByText("Solid daily driver.")).toBeInTheDocument());
  });

  it("toasts and renders no summary on failure", async () => {
    vi.mocked(postJson).mockRejectedValue(new Error("boom"));
    renderWithIntl(<ConditionSummary id="cs-failure" />);
    await waitFor(() => expect(screen.getByText("AI summary unavailable")).toBeInTheDocument());
    expect(screen.queryByText(/daily driver/)).toBeNull();
  });
});
