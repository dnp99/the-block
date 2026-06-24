"use client";

import { useEffect, useMemo, useState } from "react";
import { AuctionTabs, type AuctionTab } from "@/components/search/AuctionTabs";
import { FilterChips, type Chip } from "@/components/search/FilterChips";
import { FilterPanel } from "@/components/search/FilterPanel";
import { Toolbar } from "@/components/search/Toolbar";
import { VehicleList } from "@/components/search/VehicleList";
import { Button } from "@/components/ui/Button";
import { auctionState, type AuctionState } from "@/lib/auction";
import { useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { SearchFilters } from "@/lib/contracts/search";
import type { BodyStyle, Vehicle } from "@/lib/contracts/vehicle";
import { applyFilters, sortVehicles, type SortKey } from "@/lib/filters";
import { effectivePrice } from "@/lib/format";

export interface PhasedVehicle {
  vehicle: Vehicle;
  state: AuctionState;
}

type Range = [number, number];

const PAGE = 24;

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

const isNarrowed = (range: Range, bounds: Range) =>
  range[0] > bounds[0] || range[1] < bounds[1];

/** Owns pagination; remounted via `key` on filter change to reset to PAGE. */
function PaginatedResults({ items, nowMs }: { items: PhasedVehicle[]; nowMs: number }) {
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
  const facets = useMemo(
    () => ({
      makes: uniqueSorted(vehicles.map((v) => v.make)),
      bodyStyles: uniqueSorted(vehicles.map((v) => v.body_style)),
      provinces: uniqueSorted(vehicles.map((v) => v.province)),
    }),
    [vehicles],
  );

  const bounds = useMemo(() => {
    let minYear = Infinity;
    let maxYear = -Infinity;
    let maxOdo = 0;
    let maxPrice = 0;
    for (const v of vehicles) {
      minYear = Math.min(minYear, v.year);
      maxYear = Math.max(maxYear, v.year);
      maxOdo = Math.max(maxOdo, v.odometer_km);
      maxPrice = Math.max(maxPrice, effectivePrice(v));
    }
    return {
      year: [minYear, maxYear] as Range,
      odo: [0, Math.ceil(maxOdo / 10000) * 10000] as Range,
      price: [0, Math.ceil(maxPrice / 5000) * 5000] as Range,
    };
  }, [vehicles]);

  // Merge any locally-placed bids so rows reflect updated price/count + reserve.
  const overrides = useBidOverrides();
  const effectiveVehicles = useMemo(
    () =>
      vehicles.map((v) => {
        const o = overrides[v.id];
        return o ? { ...v, current_bid: o.amount, bid_count: o.count } : v;
      }),
    [vehicles, overrides],
  );

  const [now, setNow] = useState(anchorMs);
  const [tab, setTab] = useState<AuctionTab>("all");
  const [query, setQuery] = useState("");
  const [make, setMake] = useState("");
  const [bodyStyle, setBodyStyle] = useState("");
  const [province, setProvince] = useState("");
  const [conditionMin, setConditionMin] = useState("");
  const [yearRange, setYearRange] = useState<Range>(bounds.year);
  const [odoRange, setOdoRange] = useState<Range>(bounds.odo);
  const [priceRange, setPriceRange] = useState<Range>(bounds.price);
  const [sort, setSort] = useState<SortKey>("ending");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

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
      year_min: yearRange[0] > bounds.year[0] ? yearRange[0] : undefined,
      year_max: yearRange[1] < bounds.year[1] ? yearRange[1] : undefined,
      odometer_min: odoRange[0] > bounds.odo[0] ? odoRange[0] : undefined,
      odometer_max: odoRange[1] < bounds.odo[1] ? odoRange[1] : undefined,
      price_min: priceRange[0] > bounds.price[0] ? priceRange[0] : undefined,
      price_max: priceRange[1] < bounds.price[1] ? priceRange[1] : undefined,
    };
    return sortVehicles(applyFilters(effectiveVehicles, filters), sort);
  }, [effectiveVehicles, query, make, bodyStyle, province, conditionMin, yearRange, odoRange, priceRange, sort, bounds]);

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
    setYearRange(bounds.year);
    setOdoRange(bounds.odo);
    setPriceRange(bounds.price);
  };

  const num = (n: number) => n.toLocaleString("en-CA");
  const chips: Chip[] = [];
  if (query) chips.push({ key: "q", label: `“${query}”`, onRemove: () => setQuery("") });
  if (make) chips.push({ key: "make", label: make, onRemove: () => setMake("") });
  if (bodyStyle) chips.push({ key: "body", label: bodyStyle, onRemove: () => setBodyStyle("") });
  if (province) chips.push({ key: "prov", label: province, onRemove: () => setProvince("") });
  if (conditionMin)
    chips.push({ key: "cond", label: `Condition ${conditionMin}+`, onRemove: () => setConditionMin("") });
  if (isNarrowed(yearRange, bounds.year))
    chips.push({ key: "year", label: `${yearRange[0]}–${yearRange[1]}`, onRemove: () => setYearRange(bounds.year) });
  if (isNarrowed(odoRange, bounds.odo))
    chips.push({ key: "odo", label: `${num(odoRange[0])}–${num(odoRange[1])} km`, onRemove: () => setOdoRange(bounds.odo) });
  if (isNarrowed(priceRange, bounds.price))
    chips.push({ key: "price", label: `$${num(priceRange[0])}–$${num(priceRange[1])}`, onRemove: () => setPriceRange(bounds.price) });

  const filterKey = [
    tab, sort, query, make, bodyStyle, province, conditionMin,
    ...yearRange, ...odoRange, ...priceRange,
  ].join("|");

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Browse inventory</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {vehicles.length} vehicles up for auction across Canada.
        </p>
      </div>

      <AuctionTabs value={tab} onChange={setTab} counts={counts} />

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-6">
        <aside
          className={cn(
            "mb-4 lg:mb-0 lg:block lg:self-start lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto",
            showFilters ? "block" : "hidden",
          )}
        >
          <FilterPanel
            make={make}
            onMake={setMake}
            bodyStyle={bodyStyle}
            onBodyStyle={setBodyStyle}
            province={province}
            onProvince={setProvince}
            conditionMin={conditionMin}
            onConditionMin={setConditionMin}
            makeOptions={facets.makes}
            bodyStyleOptions={facets.bodyStyles}
            provinceOptions={facets.provinces}
            yearBounds={bounds.year}
            yearRange={yearRange}
            onYearRange={setYearRange}
            odoBounds={bounds.odo}
            odoRange={odoRange}
            onOdoRange={setOdoRange}
            priceBounds={bounds.price}
            priceRange={priceRange}
            onPriceRange={setPriceRange}
            hasActiveFilters={chips.length > 0}
            onClearAll={reset}
          />
        </aside>

        <div className="flex flex-col gap-4">
          <Toolbar
            query={query}
            onQuery={setQuery}
            sort={sort}
            onSort={setSort}
            resultCount={results.length}
            totalCount={vehicles.length}
            activeFilterCount={chips.length}
            onToggleFilters={() => setShowFilters((s) => !s)}
          />
          <FilterChips chips={chips} onClearAll={reset} />
          <PaginatedResults key={filterKey} items={results} nowMs={now} />
        </div>
      </div>
    </section>
  );
}
