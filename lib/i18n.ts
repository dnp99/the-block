export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "tb-locale";
export const LOCALE_LABELS: Record<Locale, string> = { en: "EN", fr: "FR" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
export function intlLocale(locale: string): string {
  return locale === "fr" ? "fr-CA" : "en-CA";
}
