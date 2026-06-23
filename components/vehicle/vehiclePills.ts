/*
  Shared mapping from vehicle data → pill tone + label, so the card and the
  detail page label condition and title status identically.
*/
import type { PillTone } from "@/components/ui/Pill";
import type { TitleStatus, Vehicle } from "@/lib/contracts/vehicle";
import { formatGrade } from "@/lib/format";

export function conditionPill(grade: Vehicle["condition_grade"]): {
  tone: PillTone;
  label: string;
} {
  const tone: PillTone = grade >= 4 ? "green" : grade >= 2.5 ? "amber" : "red";
  return { tone, label: formatGrade(grade) };
}

const TITLE_TONE: Record<TitleStatus, PillTone> = {
  clean: "blue",
  rebuilt: "amber",
  salvage: "red",
};

export function titlePill(status: TitleStatus): { tone: PillTone; label: string } {
  return { tone: TITLE_TONE[status], label: `${status} title` };
}
