"use client";

import { useTranslations } from "next-intl";

export interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function FilterChips({
  chips,
  onClearAll,
}: {
  chips: Chip[];
  onClearAll: () => void;
}) {
  const t = useTranslations("chips");
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 pl-2.5 pr-2 text-xs font-medium capitalize text-primary-700 transition hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
          aria-label={t("remove", { label: c.label })}
        >
          {c.label}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded text-xs font-medium text-ink-muted underline-offset-2 transition hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {t("clearAll")}
      </button>
    </div>
  );
}
