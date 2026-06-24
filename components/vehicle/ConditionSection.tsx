import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { ConditionSummary } from "@/components/vehicle/ConditionSummary";
import {
  conditionDescriptor,
  conditionPill,
  titleExplainer,
  titlePill,
} from "@/components/vehicle/vehiclePills";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatGrade } from "@/lib/format";

const HIGH_SEVERITY =
  /transmission|engine|frame|structural|water|flood|rust|leak|airbag|accident|electrical|brake/i;

export function ConditionSection({ vehicle: v }: { vehicle: Vehicle }) {
  const condition = conditionPill(v.condition_grade);
  const title = titlePill(v.title_status);
  const explainer = titleExplainer(v.title_status);
  const gauge =
    v.condition_grade >= 4
      ? "bg-success"
      : v.condition_grade >= 2.5
        ? "bg-warning"
        : "bg-error";
  const titleTone =
    title.tone === "red"
      ? "border-error/30 bg-error-soft"
      : "border-warning/30 bg-warning-soft";
  const titleText = title.tone === "red" ? "text-error" : "text-warning";

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink">Condition &amp; disclosures</h2>

      <ConditionSummary id={v.id} />

      {explainer && (
        <div className={cn("flex items-start gap-2 rounded-xl border p-3", titleTone)}>
          <svg aria-hidden viewBox="0 0 24 24" className={cn("mt-0.5 h-4 w-4 shrink-0", titleText)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
          <p className="text-sm text-ink-muted">
            <span className={cn("font-semibold capitalize", titleText)}>
              {v.title_status} title
            </span>{" "}
            — {explainer}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-canvas p-3">
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold text-ink">
              {formatGrade(v.condition_grade)}
            </span>
            <span className="text-xs text-ink-subtle">condition grade</span>
          </div>
          <Pill tone={condition.tone}>{conditionDescriptor(v.condition_grade)}</Pill>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
          <div
            className={cn("h-full rounded-full", gauge)}
            style={{ width: `${(v.condition_grade / 5) * 100}%` }}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Inspector report
        </h3>
        <p className="text-sm leading-6 text-ink-muted">{v.condition_report}</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
            Damage notes
          </h3>
          {v.damage_notes.length > 0 && (
            <span className="rounded-full bg-warning-soft px-1.5 py-0.5 text-[11px] font-semibold text-warning">
              {v.damage_notes.length} disclosure{v.damage_notes.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {v.damage_notes.length === 0 ? (
          <p className="flex items-center gap-1.5 text-sm text-success">
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            No damage reported
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {v.damage_notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
                <span
                  aria-hidden
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    HIGH_SEVERITY.test(note) ? "bg-error" : "bg-warning",
                  )}
                />
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
