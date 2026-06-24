/*
  Claude prompts + tool definitions. Centralized and commented so the AI's
  contract is reviewable. The search endpoint forces a tool call so Claude
  returns structured filters (not prose), which we then validate.
*/
import type { Anthropic } from "@anthropic-ai/sdk";
import {
  BODY_STYLES,
  DRIVETRAINS,
  FUEL_TYPES,
  PROVINCES,
  TITLE_STATUSES,
  type Vehicle,
} from "@/lib/contracts/vehicle";

export const MAKES = [
  "BMW", "Chevrolet", "Ford", "GMC", "Honda", "Hyundai", "Jeep", "Kia",
  "Mazda", "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen",
];

export const SEARCH_SYSTEM = `You convert a shopper's natural-language query for a used-vehicle auction into structured filters by calling the apply_filters tool. Extract only the constraints the query clearly implies; leave everything else unset.

Mapping guidance:
- "cheap", "under $X", "below X", "max X" → price_max; "over X", "at least X" → price_min
- "low mileage/km", "under X km" → odometer_max
- "newer than YYYY", "YYYY or newer" → year_min; "older than", "up to YYYY" → year_max
- brand/maker names → make (use the canonical name)
- "electric/EV", "hybrid", "diesel", "gas/gasoline" → fuel_type
- "AWD", "4x4/4WD", "FWD", "RWD" → drivetrain
- "clean title", "salvage", "rebuilt" → title_status
- body types (SUV, truck, sedan, coupe, hatchback) → body_style
- province or city names → province
- "good/excellent condition" → condition_min (a number 1-5; "good"≈4, "excellent"≈4.5)
- model names, trims, colors, or features that don't map to a field → keywords (array)

Only use values from the allowed lists. Known makes: ${MAKES.join(", ")}. Provinces: ${PROVINCES.join(", ")}. If the query is vague, set few or no fields.`;

export const SEARCH_TOOL: Anthropic.Tool = {
  name: "apply_filters",
  description: "Apply structured search filters extracted from the shopper's query.",
  input_schema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Free-text terms (model, trim, color, feature) not covered by a field.",
      },
      make: { type: "string", description: `Vehicle make, e.g. ${MAKES.slice(0, 4).join(", ")}` },
      body_style: { type: "string", enum: [...BODY_STYLES] },
      drivetrain: { type: "string", enum: [...DRIVETRAINS] },
      fuel_type: { type: "string", enum: [...FUEL_TYPES] },
      title_status: { type: "string", enum: [...TITLE_STATUSES] },
      province: { type: "string", enum: [...PROVINCES] },
      odometer_min: { type: "number", description: "Minimum odometer in km" },
      odometer_max: { type: "number", description: "Maximum odometer in km" },
      price_min: { type: "number", description: "Minimum price in CAD" },
      price_max: { type: "number", description: "Maximum price in CAD" },
      year_min: { type: "number" },
      year_max: { type: "number" },
      condition_min: { type: "number", description: "Minimum condition grade, 1-5" },
    },
  },
};

/* ── Condition summary ──────────────────────────────────────────────────── */

export const CONDITION_SUMMARY_SYSTEM = `You help a used-vehicle auction buyer quickly judge a vehicle's condition. Given the inspection grade (1-5), the inspector's report, listed damage, and the title status, write a balanced 2-3 sentence plain-English summary to help them decide whether to bid.

Rules:
- Be factual and grounded ONLY in the data provided. Never invent specifics.
- Lead with the overall condition, then flag the real concerns — especially a salvage/rebuilt title or significant damage.
- Do NOT mention price or tell the buyer to bid; only summarize condition and risk.
- No preamble, no markdown, no bullet points — just the sentences.`;

export function conditionSummaryUserMessage(
  v: Pick<Vehicle, "condition_grade" | "condition_report" | "damage_notes" | "title_status">,
): string {
  return [
    `Condition grade: ${v.condition_grade} out of 5`,
    `Title status: ${v.title_status}`,
    `Inspector report: ${v.condition_report}`,
    `Damage notes: ${v.damage_notes.length ? v.damage_notes.join("; ") : "None reported"}`,
  ].join("\n");
}
