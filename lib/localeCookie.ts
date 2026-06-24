import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

/*
  Persist the chosen locale in a cookie (read server-side in i18n/request.ts).
  Kept out of the component so it's a plain DOM side-effect, not a flagged
  mutation inside a React render/hook scope.
*/
export function persistLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}
