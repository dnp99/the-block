"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import type { AuctionPhase } from "@/lib/auction";

export type AuctionTab = "all" | AuctionPhase;

const TAB_KEYS: AuctionTab[] = ["all", "live", "upcoming", "ended"];

export function AuctionTabs({
  value,
  onChange,
  counts,
}: {
  value: AuctionTab;
  onChange: (t: AuctionTab) => void;
  counts: Record<AuctionTab, number>;
}) {
  const t = useTranslations("tabs");
  return (
    <div role="tablist" aria-label="Auction status" className="flex gap-1 border-b border-line">
      {TAB_KEYS.map((key) => {
        const active = value === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              "relative flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:px-4",
              active ? "text-primary-700" : "text-ink-muted hover:text-ink",
            )}
          >
            {key === "live" && (
              <span
                aria-hidden
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  active ? "bg-success" : "bg-ink-subtle",
                )}
              />
            )}
            {t(key)}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                active
                  ? "bg-primary-100 text-primary-700"
                  : "bg-neutral-100 text-ink-muted dark:bg-neutral-800",
              )}
            >
              {counts[key]}
            </span>
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary-600"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
