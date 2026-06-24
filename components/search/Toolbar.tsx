"use client";

import { SORT_OPTIONS, type SortKey } from "@/lib/filters";

export function Toolbar({
  query,
  onQuery,
  sort,
  onSort,
  resultCount,
  totalCount,
  activeFilterCount,
  onToggleFilters,
}: {
  query: string;
  onQuery: (v: string) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  resultCount: number;
  totalCount: number;
  activeFilterCount: number;
  onToggleFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggleFilters}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 lg:hidden"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary-100 px-1.5 text-xs font-semibold text-primary-700">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="relative min-w-[12rem] flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search make, model, dealership…"
            aria-label="Search inventory"
            className="w-full rounded-xl border border-line bg-surface px-3 py-2 pr-9 text-sm text-ink outline-none transition hover:border-line-strong focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-subtle transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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

        <label className="flex items-center gap-1">
          <span className="sr-only">Sort by</span>
          <select
            aria-label="Sort by"
            value={sort}
            onChange={(e) => onSort(e.target.value as SortKey)}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink outline-none transition hover:border-line-strong focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm text-ink-muted">
        <span className="font-semibold text-ink">{resultCount}</span> of {totalCount}{" "}
        vehicles
      </p>
    </div>
  );
}
