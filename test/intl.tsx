/*
  Test helpers that wrap components/hooks in next-intl's provider with the real
  message catalogs, so anything using useTranslations/useLocale works under test.
*/
import { render, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement, ReactNode } from "react";
import { ToastProvider } from "@/components/shared/Toaster";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";
import type { Locale } from "@/lib/i18n";

const messages = { en, fr } as const;

function makeWrapper(locale: Locale) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        <ToastProvider>{children}</ToastProvider>
      </NextIntlClientProvider>
    );
  };
}

/** render() with the intl provider (defaults to English). */
export function renderWithIntl(ui: ReactElement, locale: Locale = "en") {
  return render(ui, { wrapper: makeWrapper(locale) });
}

/** renderHook() with the intl provider (defaults to English). */
export function renderHookWithIntl<R>(hook: () => R, locale: Locale = "en") {
  return renderHook(hook, { wrapper: makeWrapper(locale) });
}
