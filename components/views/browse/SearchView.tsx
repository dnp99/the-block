"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuctionTabs } from "@/components/views/browse/AuctionTabs";
import { FilterChips } from "@/components/views/browse/FilterChips";
import { FilterPanel } from "@/components/views/browse/FilterPanel";
import { ResultsSkeleton } from "@/components/views/browse/ResultsSkeleton";
import { Toolbar } from "@/components/views/browse/Toolbar";
import { VehicleList } from "@/components/views/browse/VehicleList";
import { Button } from "@/components/shared/Button";
import { InfoHint } from "@/components/shared/InfoHint";
import { useVehicleSearch, type PhasedVehicle } from "@/hooks/useVehicleSearch";
import type { Vehicle } from "@/lib/contracts/vehicle";

export type { PhasedVehicle };

const PAGE = 24;

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
  const search = useVehicleSearch(vehicles, auctionNowMs);
  const tBrowse = useTranslations("browse");
  const tStates = useTranslations("states");

  const filterPanel = <FilterPanel {...search.filterPanelProps} />;

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{tBrowse("heading")}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {tBrowse("subtitle", { count: vehicles.length })}
        </p>
      </div>

      <AuctionTabs value={search.tab} onChange={search.setTab} counts={search.counts} />

      <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-6">
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
          {filterPanel}
        </aside>

        <div className="flex flex-col gap-4">
          <Toolbar
            query={search.query}
            onQuery={search.setQuery}
            sort={search.sort}
            onSort={search.setSort}
            resultCount={search.results.length}
            totalCount={vehicles.length}
            activeFilterCount={search.chips.length}
            onToggleFilters={search.toggleFilters}
            loading={search.aiLoading}
          />
          {search.showFilters && <div className="lg:hidden">{filterPanel}</div>}
          {search.chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <FilterChips chips={search.chips} onClearAll={search.reset} />
              {search.chips.some((c) => c.key.startsWith("ai-")) && (
                <InfoHint label={tStates("aiHint")} />
              )}
            </div>
          )}
          {search.aiLoading ? (
            <ResultsSkeleton />
          ) : (
            <PaginatedResults key={search.filterKey} items={search.results} nowMs={search.nowMs} />
          )}
        </div>
      </div>
    </section>
  );
}
