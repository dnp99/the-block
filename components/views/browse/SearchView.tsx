"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { AuctionTabs, type AuctionTab } from "@/components/views/browse/AuctionTabs";
import { FilterChips, type Chip } from "@/components/views/browse/FilterChips";
import { FilterPanel } from "@/components/views/browse/FilterPanel";
import { ResultsSkeleton } from "@/components/views/browse/ResultsSkeleton";
import { Toolbar } from "@/components/views/browse/Toolbar";
import { VehicleList } from "@/components/views/browse/VehicleList";
import { Button } from "@/components/shared/Button";
import { InfoHint } from "@/components/shared/InfoHint";
import { useToast } from "@/components/shared/Toaster";
import { postJson } from "@/lib/api-client";
import { auctionState, type AuctionState } from "@/lib/auction";
import { useBidOverrides } from "@/lib/bids";
import { parseSearchFilters, type SearchFilters } from "@/lib/contracts/search";
import type { BodyStyle, Vehicle } from "@/lib/contracts/vehicle";
import { applyFilters, sortVehicles, type SortKey } from "@/lib/filters";
import { effectivePrice } from "@/lib/format";
import { useFormat } from "@/hooks/useFormat";
import { useToastMessages } from "@/hooks/useToastMessages";

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

  // AI natural-language search: the query is parsed (server-side via Claude) into
  // structured filters, applied on top of the manual rail. Falls back to keyword
  // matching if the AI call fails.
  const aiCache = useRef(new Map<string, SearchFilters>());
  const [aiResult, setAiResult] = useState<{
    query: string;
    filters: SearchFilters;
  } | null>(null);
  const { toast } = useToast();
  const tBrowse = useTranslations("browse");
  const tFilters = useTranslations("filters");
  const tStates = useTranslations("states");
  const aiSearchUnavailable = useToastMessages().aiSearchUnavailable;
  const fmt = useFormat();

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    let cancelled = false;
    const cached = aiCache.current.get(q);
    const handle = window.setTimeout(async () => {
      try {
        const filters =
          cached ??
          parseSearchFilters(
            (await postJson<{ filters: unknown }>("/api/search", { query: q })).filters,
          );
        if (cancelled) return;
        aiCache.current.set(q, filters);
        setAiResult({ query: q, filters });
      } catch {
        if (cancelled) return;
        setAiResult({ query: q, filters: { keywords: q.split(/\s+/) } }); // fallback
        toast(aiSearchUnavailable, "error");
      }
    }, cached ? 0 : 600);
    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [query, toast, aiSearchUnavailable]);

  // Effective AI filters: the parsed result for the current query, or provisional
  // keyword matching while the AI call is in flight. Derived (not stored) to keep
  // state changes out of the effect body.
  const trimmedQuery = query.trim();
  const aiLoading = trimmedQuery.length >= 3 && aiResult?.query !== trimmedQuery;
  const aiFilters = useMemo<SearchFilters>(() => {
    // While the AI parses (loading), don't pre-filter — we show skeletons instead
    // of a misleading empty state. Only apply once the result for this query lands.
    if (aiResult?.query === trimmedQuery) return aiResult.filters;
    return {};
  }, [trimmedQuery, aiResult]);

  const stateById = useMemo(() => {
    const m = new Map<string, AuctionState>();
    for (const v of vehicles) m.set(v.id, auctionState(v.id, anchorMs, now));
    return m;
  }, [vehicles, anchorMs, now]);

  const searchSorted = useMemo(() => {
    // Manual filters from the rail; the search query drives aiFilters separately.
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
    return sortVehicles(filtered, sort);
  }, [effectiveVehicles, make, bodyStyle, province, conditionMin, yearRange, odoRange, priceRange, aiFilters, sort, bounds]);

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
    setAiResult(null);
  };

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

  // AI-extracted constraints (✨), individually removable.
  const removeAi = (k: keyof SearchFilters) =>
    setAiResult((p) => {
      if (!p) return p;
      const filters = { ...p.filters };
      delete filters[k];
      return { query: p.query, filters };
    });
  const ai = aiFilters;
  if (ai.keywords?.length)
    chips.push({ key: "ai-kw", label: `✨ “${ai.keywords.join(" ")}”`, onRemove: () => removeAi("keywords") });
  if (ai.make) chips.push({ key: "ai-make", label: `✨ ${ai.make}`, onRemove: () => removeAi("make") });
  if (ai.body_style) chips.push({ key: "ai-body", label: `✨ ${ai.body_style}`, onRemove: () => removeAi("body_style") });
  if (ai.drivetrain) chips.push({ key: "ai-dt", label: `✨ ${ai.drivetrain}`, onRemove: () => removeAi("drivetrain") });
  if (ai.fuel_type) chips.push({ key: "ai-fuel", label: `✨ ${ai.fuel_type}`, onRemove: () => removeAi("fuel_type") });
  if (ai.title_status) chips.push({ key: "ai-title", label: `✨ ${ai.title_status} title`, onRemove: () => removeAi("title_status") });
  if (ai.province) chips.push({ key: "ai-prov", label: `✨ ${ai.province}`, onRemove: () => removeAi("province") });
  if (ai.odometer_min) chips.push({ key: "ai-odomin", label: `✨ ≥ ${num(ai.odometer_min)} km`, onRemove: () => removeAi("odometer_min") });
  if (ai.odometer_max) chips.push({ key: "ai-odomax", label: `✨ ≤ ${num(ai.odometer_max)} km`, onRemove: () => removeAi("odometer_max") });
  if (ai.price_min) chips.push({ key: "ai-pmin", label: `✨ ≥ ${fmt.currency(ai.price_min)}`, onRemove: () => removeAi("price_min") });
  if (ai.price_max) chips.push({ key: "ai-pmax", label: `✨ ≤ ${fmt.currency(ai.price_max)}`, onRemove: () => removeAi("price_max") });
  if (ai.year_min) chips.push({ key: "ai-ymin", label: `✨ ${ai.year_min}+`, onRemove: () => removeAi("year_min") });
  if (ai.year_max) chips.push({ key: "ai-ymax", label: `✨ ≤ ${ai.year_max}`, onRemove: () => removeAi("year_max") });
  if (ai.condition_min) chips.push({ key: "ai-cond", label: `✨ Condition ${ai.condition_min}+`, onRemove: () => removeAi("condition_min") });

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
        {/* Desktop: sticky left rail */}
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
          {/* Mobile/tablet: panel opens inline, right below the Filters button */}
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
            <PaginatedResults key={filterKey} items={results} nowMs={now} />
          )}
        </div>
      </div>
    </section>
  );
}
