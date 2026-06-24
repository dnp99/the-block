"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuctionTabs, type AuctionTab } from "@/components/views/browse/AuctionTabs";
import { FilterChips, type Chip } from "@/components/views/browse/FilterChips";
import { FilterPanel } from "@/components/views/browse/FilterPanel";
import { ResultsSkeleton } from "@/components/views/browse/ResultsSkeleton";
import { Toolbar } from "@/components/views/browse/Toolbar";
import { VehicleList } from "@/components/views/browse/VehicleList";
import { Button } from "@/components/shared/Button";
import { InfoHint } from "@/components/shared/InfoHint";
import { auctionState, type AuctionState } from "@/lib/auction";
import { useBidOverrides } from "@/lib/bids";
import { buildAiFilterChips } from "@/lib/aiFilterChips";
import { BROWSE_RESET_EVENT, loadBrowseState, saveBrowseState } from "@/lib/browseState";
import type { SearchFilters } from "@/lib/contracts/search";
import type { BodyStyle, Vehicle } from "@/lib/contracts/vehicle";
import { applyFilters, sortVehicles, type SortKey } from "@/lib/filters";
import { effectivePrice } from "@/lib/format";
import { useAiSearchFilters } from "@/hooks/useAiSearchFilters";
import { useAuctionClock } from "@/hooks/useAuctionClock";
import { useFormat } from "@/hooks/useFormat";

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
function PaginatedResults({ items, nowMs }: { items: PhasedVehicle[]; nowMs: number }) {
  const [visibleCount, setVisibleCount] = useState(PAGE);
  const visible = items.slice(0, visibleCount);
  const t = useTranslations("pagination");

  return (
    <>
      <VehicleList items={visible} nowMs={nowMs} />
      {visibleCount < items.length && (
        <div className="flex flex-col items-center gap-2 pt-1">
          <p className="text-xs text-ink-subtle">
            {t("showing", { shown: visible.length, total: items.length })}
          </p>
          <Button
            variant="secondary"
            onClick={() => setVisibleCount((c) => c + PAGE)}
            className="w-auto"
          >
            {t("loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}

export function SearchView({
  vehicles,
  auctionNowMs,
}: {
  vehicles: Vehicle[];
  auctionNowMs: number;
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

  const overrides = useBidOverrides();
  const effectiveVehicles = useMemo(
    () =>
      vehicles.map((v) => {
        const o = overrides[v.id];
        return o ? { ...v, current_bid: o.amount, bid_count: o.count } : v;
      }),
    [vehicles, overrides],
  );

  const { anchorMs, nowMs } = useAuctionClock(auctionNowMs);
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

  const tBrowse = useTranslations("browse");
  const tFilters = useTranslations("filters");
  const tStates = useTranslations("states");
  const fmt = useFormat();

  const { aiFilters, aiLoading, removeAiFilter, resetAi, restoreAi } = useAiSearchFilters(query);

  // Restore the browse state saved before navigating to a VDP (or a reload). The Header logo
  // clears the store, so only the back button / reload re-applies filters.
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return; // already restored (StrictMode re-invoke / re-run) — skip
    const s = loadBrowseState();
    if (s) {
      // One-time hydration from sessionStorage (unavailable during SSR, so a lazy initializer
      // would cause a hydration mismatch — the mount effect is the correct place).
      /* eslint-disable react-hooks/set-state-in-effect */
      setTab(s.tab);
      setQuery(s.query);
      setMake(s.make);
      setBodyStyle(s.bodyStyle);
      setProvince(s.province);
      setConditionMin(s.conditionMin);
      setYearRange(s.yearRange);
      setOdoRange(s.odoRange);
      setPriceRange(s.priceRange);
      setSort(s.sort);
      /* eslint-enable react-hooks/set-state-in-effect */
      if (s.query && Object.keys(s.aiFilters).length > 0) {
        restoreAi({ query: s.query, filters: s.aiFilters });
      }
    }
    hydrated.current = true;
  }, [restoreAi]);

  useEffect(() => {
    if (!hydrated.current) return;
    saveBrowseState({
      tab, query, make, bodyStyle, province, conditionMin,
      yearRange, odoRange, priceRange, sort, aiFilters,
    });
  }, [tab, query, make, bodyStyle, province, conditionMin, yearRange, odoRange, priceRange, sort, aiFilters]);

  const stateById = useMemo(() => {
    const m = new Map<string, AuctionState>();
    for (const v of vehicles) m.set(v.id, auctionState(v.id, anchorMs, nowMs));
    return m;
  }, [vehicles, anchorMs, nowMs]);

  const searchSorted = useMemo(() => {
    const manual: SearchFilters = {
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
    const filtered = applyFilters(applyFilters(effectiveVehicles, manual), aiFilters);
    return sortVehicles(filtered, sort, anchorMs);
  }, [effectiveVehicles, make, bodyStyle, province, conditionMin, yearRange, odoRange, priceRange, aiFilters, sort, bounds, anchorMs]);

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

  const reset = useCallback(() => {
    setQuery("");
    setMake("");
    setBodyStyle("");
    setProvince("");
    setConditionMin("");
    setYearRange(bounds.year);
    setOdoRange(bounds.odo);
    setPriceRange(bounds.price);
    resetAi();
  }, [bounds, resetAi]);

  // The header logo broadcasts a reset (same-route nav doesn't remount this view). Unlike the
  // "Clear all" chips button (filters only), the logo also returns to the All tab.
  useEffect(() => {
    const onReset = () => {
      reset();
      setTab("all");
    };
    window.addEventListener(BROWSE_RESET_EVENT, onReset);
    return () => window.removeEventListener(BROWSE_RESET_EVENT, onReset);
  }, [reset]);

  const num = fmt.number;
  const chips: Chip[] = [];
  if (make) chips.push({ key: "make", label: make, onRemove: () => setMake("") });
  if (bodyStyle) chips.push({ key: "body", label: bodyStyle, onRemove: () => setBodyStyle("") });
  if (province) chips.push({ key: "prov", label: province, onRemove: () => setProvince("") });
  if (conditionMin)
    chips.push({ key: "cond", label: tFilters("conditionPlus", { n: conditionMin }), onRemove: () => setConditionMin("") });
  if (isNarrowed(yearRange, bounds.year))
    chips.push({ key: "year", label: `${yearRange[0]}–${yearRange[1]}`, onRemove: () => setYearRange(bounds.year) });
  if (isNarrowed(odoRange, bounds.odo))
    chips.push({ key: "odo", label: `${num(odoRange[0])}–${num(odoRange[1])} km`, onRemove: () => setOdoRange(bounds.odo) });
  if (isNarrowed(priceRange, bounds.price))
    chips.push({ key: "price", label: `${fmt.currency(priceRange[0])}–${fmt.currency(priceRange[1])}`, onRemove: () => setPriceRange(bounds.price) });

  const aiChips = buildAiFilterChips(aiFilters, { number: num, currency: fmt.currency });
  for (const aiChip of aiChips) {
    chips.push({
      key: aiChip.key,
      label: aiChip.label,
      onRemove: () => {
        removeAiFilter(aiChip.filterKey);
        if (aiChips.length === 1) setQuery("");
      },
    });
  }

  const filterKey = [
    tab, sort, make, bodyStyle, province, conditionMin,
    ...yearRange, ...odoRange, ...priceRange,
    JSON.stringify(aiFilters),
  ].join("|");

  const filterPanel = (
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
  );

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{tBrowse("heading")}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {tBrowse("subtitle", { count: vehicles.length })}
        </p>
      </div>

      <AuctionTabs value={tab} onChange={setTab} counts={counts} />

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-6">
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          {filterPanel}
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
            loading={aiLoading}
          />
          {showFilters && <div className="lg:hidden">{filterPanel}</div>}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <FilterChips chips={chips} onClearAll={reset} />
              {chips.some((c) => c.key.startsWith("ai-")) && (
                <InfoHint label={tStates("aiHint")} />
              )}
            </div>
          )}
          {aiLoading ? (
            <ResultsSkeleton />
          ) : (
            <PaginatedResults key={filterKey} items={results} nowMs={nowMs} />
          )}
        </div>
      </div>
    </section>
  );
}
