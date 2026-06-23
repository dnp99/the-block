"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "@/components/search/FilterBar";
import { VehicleGrid } from "@/components/search/VehicleGrid";
import type { SearchFilters } from "@/lib/contracts/search";
import type { BodyStyle, Vehicle } from "@/lib/contracts/vehicle";
import { applyFilters, sortVehicles, type SortKey } from "@/lib/filters";

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

export function SearchView({ vehicles }: { vehicles: Vehicle[] }) {
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [bodyStyle, setBodyStyle] = useState("");
  const [province, setProvince] = useState("");
  const [sort, setSort] = useState<SortKey>("bids");

  const facets = useMemo(
    () => ({
      makes: uniqueSorted(vehicles.map((v) => v.make)),
      bodyStyles: uniqueSorted(vehicles.map((v) => v.body_style)),
      provinces: uniqueSorted(vehicles.map((v) => v.province)),
    }),
    [vehicles],
  );

  const results = useMemo(() => {
    const keywords = query.trim() ? query.trim().split(/\s+/) : undefined;
    const filters: SearchFilters = {
      keywords,
      make: make || undefined,
      body_style: (bodyStyle || undefined) as BodyStyle | undefined,
      province: province || undefined,
    };
    return sortVehicles(applyFilters(vehicles, filters), sort);
  }, [vehicles, query, make, bodyStyle, province, sort]);

  const hasActiveFilters = Boolean(query || make || bodyStyle || province);

  const reset = () => {
    setQuery("");
    setMake("");
    setBodyStyle("");
    setProvince("");
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Browse inventory
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {vehicles.length} vehicles up for auction across Canada.
        </p>
      </div>

      <FilterBar
        query={query}
        onQuery={setQuery}
        make={make}
        onMake={setMake}
        bodyStyle={bodyStyle}
        onBodyStyle={setBodyStyle}
        province={province}
        onProvince={setProvince}
        sort={sort}
        onSort={setSort}
        makeOptions={facets.makes}
        bodyStyleOptions={facets.bodyStyles}
        provinceOptions={facets.provinces}
        resultCount={results.length}
        totalCount={vehicles.length}
        hasActiveFilters={hasActiveFilters}
        onReset={reset}
      />

      <VehicleGrid vehicles={results} />
    </section>
  );
}
