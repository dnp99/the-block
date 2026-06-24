import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeVehicle } from "@/test/fixtures";
import { renderWithIntl } from "@/test/intl";

// ConditionSection embeds ConditionSummary (which fetches) — keep it pending so
// there's no async state churn during the render.
vi.mock("@/lib/api-client", () => ({ postJson: vi.fn(() => new Promise(() => {})) }));

import { ConditionSection } from "@/components/views/vehicle/ConditionSection";

describe("ConditionSection", () => {
  it("renders grade, descriptor, report, and 'No damage reported'", () => {
    const v = makeVehicle({
      id: "cs-clean",
      condition_grade: 4.3,
      condition_report: "Runs and drives clean.",
      damage_notes: [],
      title_status: "clean",
    });
    renderWithIntl(<ConditionSection vehicle={v} />);
    expect(screen.getByText("Condition & disclosures")).toBeInTheDocument();
    expect(screen.getByText("4.3 / 5")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("Inspector report")).toBeInTheDocument();
    expect(screen.getByText("Runs and drives clean.")).toBeInTheDocument();
    expect(screen.getByText("No damage reported")).toBeInTheDocument();
  });

  it("lists damage notes + disclosure count and the rebuilt-title pill", () => {
    const v = makeVehicle({
      id: "cs-rebuilt",
      title_status: "rebuilt",
      damage_notes: ["Dent on driver door", "Minor scrape"],
    });
    renderWithIntl(<ConditionSection vehicle={v} />);
    expect(screen.getByText("Dent on driver door")).toBeInTheDocument();
    expect(screen.getByText("Minor scrape")).toBeInTheDocument();
    expect(screen.getByText("2 disclosures")).toBeInTheDocument();
    expect(screen.getByText("rebuilt title")).toBeInTheDocument();
  });
});
