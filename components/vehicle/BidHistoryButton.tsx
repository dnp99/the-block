"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { BidOverride } from "@/lib/contracts/bid";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { buildBidHistory, formatAgo } from "@/lib/bidHistory";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";

export function BidHistoryButton({
  vehicle,
  count,
  override,
  nowMs,
}: {
  vehicle: Vehicle;
  count: number;
  override: BidOverride | undefined;
  nowMs: number;
}) {
  const [open, setOpen] = useState(false);
  const tBid = useTranslations("bidding");
  const tHistory = useTranslations("history");

  if (count <= 0) {
    return <span className="text-sm text-ink-muted">{tBid("noBidsYet")}</span>;
  }

  const entries = open ? buildBidHistory(vehicle, override, nowMs) : [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer rounded text-sm text-ink-muted underline decoration-dotted underline-offset-2 transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {tBid("bidCount", { count })}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={tHistory("title")}>
        <ul className="flex flex-col divide-y divide-line">
          {entries.map((e, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    e.isYou ? "text-success" : "text-ink",
                  )}
                >
                  {formatCurrency(e.amount)}
                </span>
                {e.isYou && (
                  <span className="rounded-full bg-success-soft px-1.5 py-0.5 text-[11px] font-semibold text-success">
                    {tHistory("you")}
                  </span>
                )}
              </div>
              <div className="text-right">
                {!e.isYou && (
                  <p className="font-mono text-xs text-ink-muted">{e.bidder}</p>
                )}
                <p className="text-xs text-ink-subtle">{formatAgo(e.secondsAgo)}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-line pt-3 text-xs text-ink-subtle">
          {tHistory("footnote")}
        </p>
      </Modal>
    </>
  );
}
