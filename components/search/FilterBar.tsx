"use client";

import { cn } from "@/lib/cn";
import { SORT_OPTIONS, type SortKey } from "@/lib/filters";

const selectClass =
  "rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition hover:border-line-strong focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30";

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
    <label className="flex flex-col gap-1">
      <span className="sr-only">{label}</span>
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
    </label>
  );
}

export interface FilterBarProps {
  query: string;
  onQuery: (v: string) => void;
  make: string;
  onMake: (v: string) => void;
  bodyStyle: string;
  onBodyStyle: (v: string) => void;
  province: string;
  onProvince: (v: string) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  makeOptions: string[];
  bodyStyleOptions: string[];
  provinceOptions: string[];
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function FilterBar(props: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={props.query}
        onChange={(e) => props.onQuery(e.target.value)}
        placeholder="Search make, model, dealership…"
        aria-label="Search inventory"
        className="w-full rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition hover:border-line-strong focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30"
      />

      <div className="flex flex-wrap items-center gap-2">
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
        <label className="flex flex-col gap-1">
          <span className="sr-only">Sort by</span>
          <select
            aria-label="Sort by"
            value={props.sort}
            onChange={(e) => props.onSort(e.target.value as SortKey)}
            className={selectClass}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {props.hasActiveFilters && (
          <button
            type="button"
            onClick={props.onReset}
            className="rounded-xl px-3 py-2 text-sm font-medium text-primary-600 transition hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-primary-900/30"
          >
            Reset
          </button>
        )}

        <p className="ml-auto text-sm text-ink-muted">
          <span className="font-semibold text-ink">{props.resultCount}</span> of{" "}
          {props.totalCount} vehicles
        </p>
      </div>
    </div>
  );
}
