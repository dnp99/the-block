/*
  next-intl request config (no URL routing). The active locale comes from the
  `tb-locale` cookie set by the language toggle; we default to English. Because
  this resolves server-side, the correct language is in the initial HTML — no
  flash, unlike a client-only toggle.
*/
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export default getRequestConfig(async () => {
  const cookieValue = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
