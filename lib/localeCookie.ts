import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";
export function persistLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}
