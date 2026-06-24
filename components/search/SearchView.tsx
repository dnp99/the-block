"use client";

import { useEffect, useMemo, useState } from "react";
import { AuctionTabs, type AuctionTab } from "@/components/search/AuctionTabs";
import { FilterBar } from "@/components/search/FilterBar";
import { FilterChips, type Chip } from "@/components/search/FilterChips";
import { VehicleList } from "@/components/search/VehicleList";
import { Button } from "@/components/ui/Button";
import { auctionState, type AuctionState } from "@/lib/auction";
import type { SearchFilters } from "@/lib/contracts/search";
import type { BodyStyle, Vehicle } from "@/lib/contracts/vehicle";
import { applyFilters, sortVehicles, type SortKey } from "@/lib/filters";

export interface PhasedVehicle {
  vehicle: Vehicle;
  state: AuctionState;
}

const PAGE = 24;

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

const money = (s: string) => `$${Number(s).toLocaleString("en-CA")}`;

/**
 * Owns pagination state. Remounted (resetting to PAGE) via a `key` when filters
 * change — avoids a reset-in-effect while preserving the count across clock ticks.
 */
function PaginatedResults({
  items,
  nowMs,
}: {
  items: PhasedVehicle[];
  nowMs: number;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const visible = items.slice(0, visibleCount);

  return (
    <>
      <VehicleList items={visible} nowMs={nowMs} />
      {visibleCount < items.length && (
        <div className="flex flex-col items-center gap-2 pt-1">
          <p className="text-xs text-ink-subtle">
            Showing {visible.length} of {items.length}
          </p>
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((c) => c + PAGE)}
            className="w-auto"
          >
            Load more
          </Button>
        </div>
      )}
    </>
  );
}

export function SearchView({
  vehicles,
  anchorMs,
}: {
  vehicles: Vehicle[];
  anchorMs: number;
}) {
  const [now, setNow] = useState(anchorMs);
  const [tab, setTab] = useState<AuctionTab>("all");
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [bodyStyle, setBodyStyle] = useState("");
  const [province, setProvince] = useState("");
  const [conditionMin, setConditionMin] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState<SortKey>("ending");

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

  const searchSorted = useMemo(() => {
    const keywords = query.trim() ? query.trim().split(/\s+/) : undefined;
    const filters: SearchFilters = {
      keywords,
      make: make || undefined,
      body_style: (bodyStyle || undefined) as BodyStyle | undefined,
      province: province || undefined,
      condition_min: conditionMin ? Number(conditionMin) : undefined,
      price_min: priceMin ? Number(priceMin) : undefined,
      price_max: priceMax ? Number(priceMax) : undefined,
    };
    return sortVehicles(applyFilters(vehicles, filters), sort);
  }, [vehicles, query, make, bodyStyle, province, conditionMin, priceMin, priceMax, sort]);

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

  const reset = () => {
    setQuery("");
    setMake("");
    setBodyStyle("");
    setProvince("");
    setConditionMin("");
    setPriceMin("");
    setPriceMax("");
  };

  const chips: Chip[] = [];
  if (query) chips.push({ key: "q", label: `“${query}”`, onRemove: () => setQuery("") });
  if (make) chips.push({ key: "make", label: make, onRemove: () => setMake("") });
  if (bodyStyle)
    chips.push({ key: "body", label: bodyStyle, onRemove: () => setBodyStyle("") });
  if (province)
    chips.push({ key: "prov", label: province, onRemove: () => setProvince("") });
  if (conditionMin)
    chips.push({
      key: "cond",
      label: `Condition ${conditionMin}+`,
      onRemove: () => setConditionMin(""),
    });
  if (priceMin)
    chips.push({ key: "pmin", label: `Min ${money(priceMin)}`, onRemove: () => setPriceMin("") });
  if (priceMax)
    chips.push({ key: "pmax", label: `Max ${money(priceMax)}`, onRemove: () => setPriceMax("") });

  // Changing any filter/tab/sort remounts PaginatedResults → pagination resets.
  const filterKey = [
    tab,
    sort,
    query,
    make,
    bodyStyle,
    province,
    conditionMin,
    priceMin,
    priceMax,
  ].join("|");

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

      <div className="sticky top-14 z-20 -mx-4 flex flex-col gap-3 border-b border-line bg-canvas/95 px-4 pb-3 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
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
          priceMin={priceMin}
          onPriceMin={setPriceMin}
          priceMax={priceMax}
          onPriceMax={setPriceMax}
          sort={sort}
          onSort={setSort}
          makeOptions={facets.makes}
          bodyStyleOptions={facets.bodyStyles}
          provinceOptions={facets.provinces}
          resultCount={results.length}
          totalCount={vehicles.length}
        />
        <FilterChips chips={chips} onClearAll={reset} />
      </div>

      <PaginatedResults key={filterKey} items={results} nowMs={now} />
    </section>
  );
}
