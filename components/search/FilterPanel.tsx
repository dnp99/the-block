"use client";

import { RangeSlider } from "@/components/ui/RangeSlider";
import { cn } from "@/lib/cn";

const selectClass =
  "w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition hover:border-line-strong focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  allLabel: string;
}) {
  return (
    <Field label={label}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(selectClass, "capitalize")}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
    </Field>
  );
}

export interface FilterPanelProps {
  make: string;
  onMake: (v: string) => void;
  bodyStyle: string;
  onBodyStyle: (v: string) => void;
  province: string;
  onProvince: (v: string) => void;
  conditionMin: string;
  onConditionMin: (v: string) => void;
  makeOptions: string[];
  bodyStyleOptions: string[];
  provinceOptions: string[];
  yearBounds: [number, number];
  yearRange: [number, number];
  onYearRange: (v: [number, number]) => void;
  odoBounds: [number, number];
  odoRange: [number, number];
  onOdoRange: (v: [number, number]) => void;
  priceBounds: [number, number];
  priceRange: [number, number];
  onPriceRange: (v: [number, number]) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function FilterPanel(props: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">Filters</h2>
        {props.hasActiveFilters && (
          <button
            type="button"
            onClick={props.onClearAll}
            className="rounded text-xs font-medium text-primary-600 underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Clear all
          </button>
        )}
      </div>

      <Select
        label="Make"
        value={props.make}
        onChange={props.onMake}
        options={props.makeOptions}
        allLabel="All makes"
      />
      <Select
        label="Body style"
        value={props.bodyStyle}
        onChange={props.onBodyStyle}
        options={props.bodyStyleOptions}
        allLabel="All body styles"
      />
      <Select
        label="Province"
        value={props.province}
        onChange={props.onProvince}
        options={props.provinceOptions}
        allLabel="All provinces"
      />
      <Field label="Minimum condition">
        <select
          aria-label="Minimum condition"
          value={props.conditionMin}
          onChange={(e) => props.onConditionMin(e.target.value)}
          className={selectClass}
        >
          <option value="">Any condition</option>
          <option value="4">Condition 4+</option>
          <option value="3">Condition 3+</option>
          <option value="2">Condition 2+</option>
        </select>
      </Field>

      <RangeSlider
        label="Year"
        min={props.yearBounds[0]}
        max={props.yearBounds[1]}
        value={props.yearRange}
        onValueChange={props.onYearRange}
      />
      <RangeSlider
        label="Odometer (km)"
        min={props.odoBounds[0]}
        max={props.odoBounds[1]}
        step={1000}
        value={props.odoRange}
        onValueChange={props.onOdoRange}
        format={(n) => n.toLocaleString("en-CA")}
      />
      <RangeSlider
        label="Price"
        min={props.priceBounds[0]}
        max={props.priceBounds[1]}
        step={1000}
        value={props.priceRange}
        onValueChange={props.onPriceRange}
        format={(n) => `$${n.toLocaleString("en-CA")}`}
      />
    </div>
  );
}
