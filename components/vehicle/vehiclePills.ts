/*
  Shared mapping from vehicle data → pill tone + label, so the card and the
  detail page label condition and title status identically.
*/
import type { PillTone } from "@/components/ui/Pill";
import type { TitleStatus, Vehicle } from "@/lib/contracts/vehicle";
import { effectivePrice, formatGrade } from "@/lib/format";

export function conditionPill(grade: Vehicle["condition_grade"]): {
  tone: PillTone;
  label: string;
} {
  const tone: PillTone = grade >= 4 ? "green" : grade >= 2.5 ? "amber" : "red";
  return { tone, label: formatGrade(grade) };
}

/** Qualitative word for a condition grade (used where the number is shown separately). */
export function conditionDescriptor(grade: number): string {
  if (grade >= 4.5) return "Excellent";
  if (grade >= 4) return "Good";
  if (grade >= 3) return "Average";
  if (grade >= 2) return "Fair";
  return "Rough";
}

const TITLE_TONE: Record<TitleStatus, PillTone> = {
  clean: "blue",
  rebuilt: "amber",
  salvage: "red",
};

export function titlePill(status: TitleStatus): { tone: PillTone; label: string } {
  return { tone: TITLE_TONE[status], label: `${status} title` };
}

/** Reserve status for an explicit price (so it reflects a live bid). */
export function reserveStatusFor(
  price: number,
  reservePrice: number,
): { met: boolean; tone: PillTone; label: string } {
  const met = price >= reservePrice;
  return met
    ? { met, tone: "green", label: "Reserve met" }
    : { met, tone: "amber", label: "Reserve not met" };
}

/** Whether the current/starting price has cleared the (hidden) reserve. */
export function reservePill(v: Vehicle): { met: boolean; tone: PillTone; label: string } {
  return reserveStatusFor(effectivePrice(v), v.reserve_price);
}

/** Damage disclosures summary — green when clean, amber with a count otherwise. */
export function damagePill(v: Vehicle): { tone: PillTone; label: string } {
  const n = v.damage_notes.length;
  return n === 0
    ? { tone: "green", label: "No damage" }
    : { tone: "amber", label: `${n} disclosure${n > 1 ? "s" : ""}` };
}
