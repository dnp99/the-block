"use client";

import { useLocale } from "next-intl";
import { formatCurrency, formatKm } from "@/lib/format";
import { intlLocale } from "@/lib/i18n";

/*
  Locale-bound number formatters for client components. Reads the active locale
  from next-intl so currency/distance render as en-CA ($25,000 · 47,731 km) or
  fr-CA (25 000 $ · 47 731 km).
*/
export function useFormat() {
  const locale = intlLocale(useLocale());
  return {
    locale,
    currency: (n: number) => formatCurrency(n, locale),
    km: (n: number) => formatKm(n, locale),
    number: (n: number) => new Intl.NumberFormat(locale).format(n),
  };
}
