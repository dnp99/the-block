import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { conditionPill, titlePill } from "@/components/vehicle/vehiclePills";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatGrade } from "@/lib/format";

export function ConditionSection({ vehicle: v }: { vehicle: Vehicle }) {
  const condition = conditionPill(v.condition_grade);
  const title = titlePill(v.title_status);

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Condition &amp; disclosures</h2>
        <div className="flex items-center gap-2">
          <Pill tone={title.tone}>{title.label}</Pill>
        </div>
      </div>

      {/* AI Summary slot — populated in the AI-condition slice. */}

      <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas p-3">
        <span className="text-2xl font-semibold text-ink">{formatGrade(v.condition_grade)}</span>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-ink-subtle">Condition grade</span>
          <Pill tone={condition.tone}>{condition.label}</Pill>
        </div>
      </div>

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Inspector report
        </h3>
        <p className="text-sm leading-6 text-ink-muted">{v.condition_report}</p>
      </div>

      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-subtle">
          Damage notes
        </h3>
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
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
