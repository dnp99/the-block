/*
  Locale constants shared by the server request config (i18n/request.ts) and the
  client language toggle. Kept free of server-only imports so both can use it.
*/
export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that persists the chosen locale (read server-side in request config). */
export const LOCALE_COOKIE = "tb-locale";

/** Short labels for the toggle. */
export const LOCALE_LABELS: Record<Locale, string> = { en: "EN", fr: "FR" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Map a UI locale to its Canadian BCP-47 tag for Intl formatting. */
export function intlLocale(locale: string): string {
  return locale === "fr" ? "fr-CA" : "en-CA";
}
