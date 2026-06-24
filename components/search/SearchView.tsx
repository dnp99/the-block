"use client";

import { useEffect, useMemo, useState } from "react";
import { AuctionTabs, type AuctionTab } from "@/components/search/AuctionTabs";
import { FilterBar } from "@/components/search/FilterBar";
import { VehicleList } from "@/components/search/VehicleList";
import { auctionState, type AuctionState } from "@/lib/auction";
import type { SearchFilters } from "@/lib/contracts/search";
import type { BodyStyle, Vehicle } from "@/lib/contracts/vehicle";
import { applyFilters, sortVehicles, type SortKey } from "@/lib/filters";

export interface PhasedVehicle {
  vehicle: Vehicle;
  state: AuctionState;
}

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

export function SearchView({
  vehicles,
  anchorMs,
}: {
  vehicles: Vehicle[];
  anchorMs: number;
}) {
  // `anchorMs` (from the server) fixes the auction schedule; `now` ticks so
  // phases and countdowns advance live. Both start equal → no hydration drift.
  const [now, setNow] = useState(anchorMs);
  const [tab, setTab] = useState<AuctionTab>("all");
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [bodyStyle, setBodyStyle] = useState("");
  const [province, setProvince] = useState("");
  const [conditionMin, setConditionMin] = useState("");
  const [sort, setSort] = useState<SortKey>("bids");

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const facets = useMemo(
    () => ({
      makes: uniqueSorted(vehicles.map((v) => v.make)),
      bodyStyles: uniqueSorted(vehicles.map((v) => v.body_style)),
      provinces: uniqueSorted(vehicles.map((v) => v.province)),
    }),
    [vehicles],
  );

  const stateById = useMemo(() => {
    const m = new Map<string, AuctionState>();
    for (const v of vehicles) m.set(v.id, auctionState(v.id, anchorMs, now));
    return m;
  }, [vehicles, anchorMs, now]);

  // Search/sort first (independent of the tab), so tab counts reflect filters.
  const searchSorted = useMemo(() => {
    const keywords = query.trim() ? query.trim().split(/\s+/) : undefined;
    const filters: SearchFilters = {
      keywords,
      make: make || undefined,
      body_style: (bodyStyle || undefined) as BodyStyle | undefined,
      province: province || undefined,
      condition_min: conditionMin ? Number(conditionMin) : undefined,
    };
    return sortVehicles(applyFilters(vehicles, filters), sort);
  }, [vehicles, query, make, bodyStyle, province, conditionMin, sort]);

  const counts = useMemo(() => {
    const c: Record<AuctionTab, number> = { all: 0, live: 0, upcoming: 0, ended: 0 };
    for (const v of searchSorted) {
      c.all++;
      c[stateById.get(v.id)!.phase]++;
    }
    return c;
  }, [searchSorted, stateById]);

  const results: PhasedVehicle[] = useMemo(
    () =>
      searchSorted
        .filter((v) => tab === "all" || stateById.get(v.id)!.phase === tab)
        .map((v) => ({ vehicle: v, state: stateById.get(v.id)! })),
    [searchSorted, stateById, tab],
  );

  const hasActiveFilters = Boolean(
    query || make || bodyStyle || province || conditionMin,
  );

  const reset = () => {
    setQuery("");
    setMake("");
    setBodyStyle("");
    setProvince("");
    setConditionMin("");
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

      <AuctionTabs value={tab} onChange={setTab} counts={counts} />

      <FilterBar
        query={query}
        onQuery={setQuery}
        make={make}
        onMake={setMake}
        bodyStyle={bodyStyle}
        onBodyStyle={setBodyStyle}
        province={province}
        onProvince={setProvince}
        conditionMin={conditionMin}
        onConditionMin={setConditionMin}
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

      <VehicleList items={results} nowMs={now} />
    </section>
  );
}
