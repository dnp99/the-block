"use client";

import { useTranslations } from "next-intl";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { SelectChevron } from "@/components/ui/SelectChevron";
import { cn } from "@/lib/cn";
import { useFormat } from "@/lib/useFormat";

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface px-3 py-2 pr-9 text-sm text-ink outline-none transition hover:border-line-strong focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </div>
  );
}

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
    <Field label={label}>
      <div className="relative">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(selectClass, "capitalize")}
        >
          <option value="">{allLabel}</option>
          {options.map((o) => (
            <option key={o} value={o} className="capitalize">
              {o}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </Field>
  );
}

export interface FilterPanelProps {
  make: string;
  onMake: (v: string) => void;
  bodyStyle: string;
  onBodyStyle: (v: string) => void;
  province: string;
  onProvince: (v: string) => void;
  conditionMin: string;
  onConditionMin: (v: string) => void;
  makeOptions: string[];
  bodyStyleOptions: string[];
  provinceOptions: string[];
  yearBounds: [number, number];
  yearRange: [number, number];
  onYearRange: (v: [number, number]) => void;
  odoBounds: [number, number];
  odoRange: [number, number];
  onOdoRange: (v: [number, number]) => void;
  priceBounds: [number, number];
  priceRange: [number, number];
  onPriceRange: (v: [number, number]) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
}

export function FilterPanel(props: FilterPanelProps) {
  const t = useTranslations("filters");
  const fmt = useFormat();
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{t("title")}</h2>
        {props.hasActiveFilters && (
          <button
            type="button"
            onClick={props.onClearAll}
            className="rounded text-xs font-medium text-primary-600 underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            {t("clearAll")}
          </button>
        )}
      </div>

      <Select
        label={t("make")}
        value={props.make}
        onChange={props.onMake}
        options={props.makeOptions}
        allLabel={t("allMakes")}
      />
      <Select
        label={t("bodyStyle")}
        value={props.bodyStyle}
        onChange={props.onBodyStyle}
        options={props.bodyStyleOptions}
        allLabel={t("allBodyStyles")}
      />
      <Select
        label={t("province")}
        value={props.province}
        onChange={props.onProvince}
        options={props.provinceOptions}
        allLabel={t("allProvinces")}
      />
      <Field label={t("minCondition")}>
        <div className="relative">
          <select
            aria-label={t("minCondition")}
            value={props.conditionMin}
            onChange={(e) => props.onConditionMin(e.target.value)}
            className={selectClass}
          >
            <option value="">{t("anyCondition")}</option>
            <option value="4">{t("conditionPlus", { n: 4 })}</option>
            <option value="3">{t("conditionPlus", { n: 3 })}</option>
            <option value="2">{t("conditionPlus", { n: 2 })}</option>
          </select>
          <SelectChevron />
        </div>
      </Field>

      <RangeSlider
        label={t("year")}
        min={props.yearBounds[0]}
        max={props.yearBounds[1]}
        value={props.yearRange}
        onValueChange={props.onYearRange}
      />
      <RangeSlider
        label={t("odometer")}
        min={props.odoBounds[0]}
        max={props.odoBounds[1]}
        step={1000}
        value={props.odoRange}
        onValueChange={props.onOdoRange}
        format={(n) => fmt.number(n)}
      />
      <RangeSlider
        label={t("price")}
        min={props.priceBounds[0]}
        max={props.priceBounds[1]}
        step={1000}
        value={props.priceRange}
        onValueChange={props.onPriceRange}
        format={(n) => fmt.currency(n)}
      />
    </div>
  );
}
