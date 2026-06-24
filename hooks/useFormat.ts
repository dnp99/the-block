"use client";

import { useLocale } from "next-intl";
import { formatCurrency, formatKm } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";
export function useFormat() {
  const locale = intlLocale(useLocale());
  return {
    locale,
    currency: (n: number) => formatCurrency(n, locale),
    km: (n: number) => formatKm(n, locale),
    number: (n: number) => new Intl.NumberFormat(locale).format(n),
  };
}
