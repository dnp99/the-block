"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { type AuctionTab } from "@/components/views/browse/AuctionTabs";
import { type Chip } from "@/components/views/browse/FilterChips";
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

function uniqueSorted<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));
}

const isNarrowed = (range: Range, bounds: Range) =>
  range[0] > bounds[0] || range[1] < bounds[1];

export function useVehicleSearch(vehicles: Vehicle[], auctionNowMs: number) {
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

  const tFilters = useTranslations("filters");
  const fmt = useFormat();

  const { aiFilters, aiLoading, removeAiFilter, resetAi, restoreAi } = useAiSearchFilters(query);

  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    const s = loadBrowseState();
    if (s) {
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

  const panelMake = make || aiFilters.make || "";
  const panelBodyStyle = bodyStyle || aiFilters.body_style || "";
  const panelProvince = province || aiFilters.province || "";
  const panelConditionMin =
    conditionMin || (aiFilters.condition_min != null ? String(aiFilters.condition_min) : "");
  const panelYearRange: Range = isNarrowed(yearRange, bounds.year)
    ? yearRange
    : [aiFilters.year_min ?? bounds.year[0], aiFilters.year_max ?? bounds.year[1]];
  const panelOdoRange: Range = isNarrowed(odoRange, bounds.odo)
    ? odoRange
    : [aiFilters.odometer_min ?? bounds.odo[0], aiFilters.odometer_max ?? bounds.odo[1]];
  const panelPriceRange: Range = isNarrowed(priceRange, bounds.price)
    ? priceRange
    : [aiFilters.price_min ?? bounds.price[0], aiFilters.price_max ?? bounds.price[1]];

  const handleMake = (value: string) => {
    setMake(value);
    removeAiFilter("make");
  };
  const handleBodyStyle = (value: string) => {
    setBodyStyle(value);
    removeAiFilter("body_style");
  };
  const handleProvince = (value: string) => {
    setProvince(value);
    removeAiFilter("province");
  };
  const handleConditionMin = (value: string) => {
    setConditionMin(value);
    removeAiFilter("condition_min");
  };
  const handleYearRange = (range: Range) => {
    setYearRange(range);
    removeAiFilter("year_min");
    removeAiFilter("year_max");
  };
  const handleOdoRange = (range: Range) => {
    setOdoRange(range);
    removeAiFilter("odometer_min");
    removeAiFilter("odometer_max");
  };
  const handlePriceRange = (range: Range) => {
    setPriceRange(range);
    removeAiFilter("price_min");
    removeAiFilter("price_max");
  };

  const filterPanelProps = {
    make: panelMake,
    onMake: handleMake,
    bodyStyle: panelBodyStyle,
    onBodyStyle: handleBodyStyle,
    province: panelProvince,
    onProvince: handleProvince,
    conditionMin: panelConditionMin,
    onConditionMin: handleConditionMin,
    makeOptions: facets.makes,
    bodyStyleOptions: facets.bodyStyles,
    provinceOptions: facets.provinces,
    yearBounds: bounds.year,
    yearRange: panelYearRange,
    onYearRange: handleYearRange,
    odoBounds: bounds.odo,
    odoRange: panelOdoRange,
    onOdoRange: handleOdoRange,
    priceBounds: bounds.price,
    priceRange: panelPriceRange,
    onPriceRange: handlePriceRange,
    hasActiveFilters: chips.length > 0,
    onClearAll: reset,
  };

  const toggleFilters = useCallback(() => setShowFilters((s) => !s), []);

  return {
    tab,
    setTab,
    counts,
    query,
    setQuery,
    sort,
    setSort,
    showFilters,
    toggleFilters,
    chips,
    reset,
    aiLoading,
    results,
    nowMs,
    filterKey,
    filterPanelProps,
  };
}
