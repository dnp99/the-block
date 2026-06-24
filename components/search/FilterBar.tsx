"use client";

import { cn } from "@/lib/cn";
import { SORT_OPTIONS, type SortKey } from "@/lib/filters";

const controlClass =
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
        className={cn(controlClass, "capitalize")}
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
  conditionMin: string;
  onConditionMin: (v: string) => void;
  priceMin: string;
  onPriceMin: (v: string) => void;
  priceMax: string;
  onPriceMax: (v: string) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  makeOptions: string[];
  bodyStyleOptions: string[];
  provinceOptions: string[];
  resultCount: number;
  totalCount: number;
}

export function FilterBar(props: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          type="search"
          value={props.query}
          onChange={(e) => props.onQuery(e.target.value)}
          placeholder="Search make, model, dealership…"
          aria-label="Search inventory"
          className="w-full rounded-2xl border border-line bg-surface px-4 py-2.5 pr-10 text-sm text-ink outline-none transition hover:border-line-strong focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {props.query && (
          <button
            type="button"
            onClick={() => props.onQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

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
          <span className="sr-only">Minimum condition</span>
          <select
            aria-label="Minimum condition"
            value={props.conditionMin}
            onChange={(e) => props.onConditionMin(e.target.value)}
            className={controlClass}
          >
            <option value="">Any condition</option>
            <option value="4">Condition 4+</option>
            <option value="3">Condition 3+</option>
            <option value="2">Condition 2+</option>
          </select>
        </label>

        <div className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5">
          <span className="text-xs text-ink-subtle">$</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={props.priceMin}
            onChange={(e) => props.onPriceMin(e.target.value)}
            placeholder="Min"
            aria-label="Minimum price"
            className="w-16 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span aria-hidden className="text-ink-subtle">
            –
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={props.priceMax}
            onChange={(e) => props.onPriceMax(e.target.value)}
            placeholder="Max"
            aria-label="Maximum price"
            className="w-16 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        <label className="flex flex-col gap-1">
          <span className="sr-only">Sort by</span>
          <select
            aria-label="Sort by"
            value={props.sort}
            onChange={(e) => props.onSort(e.target.value as SortKey)}
            className={controlClass}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <p className="ml-auto text-sm text-ink-muted">
          <span className="font-semibold text-ink">{props.resultCount}</span> of{" "}
          {props.totalCount} vehicles
        </p>
      </div>
    </div>
  );
}
