"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/cn";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { persistLocale } from "@/lib/localeCookie";
export function LanguageToggle() {
  const active = useLocale() as Locale;
  const t = useTranslations("languageToggle");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === active) return;
    persistLocale(next);
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="inline-flex h-9 items-center rounded-xl border border-line p-0.5 text-xs font-semibold"
    >
      {LOCALES.map((loc) => {
        const isActive = loc === active;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            aria-pressed={isActive}
            disabled={isPending}
            className={cn(
              "cursor-pointer rounded-xl px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed",
              isActive ? "bg-primary-600 text-white" : "text-ink-muted hover:text-ink",
            )}
          >
            {LOCALE_LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
