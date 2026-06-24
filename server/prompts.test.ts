import { describe, expect, it } from "vitest";
import { conditionSummaryUserMessage } from "@/server/prompts";

describe("conditionSummaryUserMessage", () => {
  it("includes grade, title, report, and joined damage notes", () => {
    const msg = conditionSummaryUserMessage({
      condition_grade: 4.3,
      condition_report: "Clean and serviced.",
      damage_notes: ["dent", "scratch"],
      title_status: "clean",
    });
    expect(msg).toContain("Condition grade: 4.3 out of 5");
    expect(msg).toContain("Title status: clean");
    expect(msg).toContain("Inspector report: Clean and serviced.");
    expect(msg).toContain("Damage notes: dent; scratch");
  });

  it("reports no damage explicitly", () => {
    const msg = conditionSummaryUserMessage({
      condition_grade: 4,
      condition_report: "x",
      damage_notes: [],
      title_status: "rebuilt",
    });
    expect(msg).toContain("Damage notes: None reported");
  });
});
