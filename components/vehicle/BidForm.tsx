"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { BID_INCREMENT, minimumBid, placeBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { useFormat } from "@/lib/useFormat";
import { useToastMessages } from "@/lib/useToastMessages";

export function BidForm({ vehicle }: { vehicle: Vehicle }) {
  const { toast } = useToast();
  const tm = useToastMessages();
  const t = useTranslations("bidding");
  const fmt = useFormat();
  const overrides = useBidOverrides();
  const override = overrides[vehicle.id];
  const min = minimumBid(vehicle, override);

  const [value, setValue] = useState(String(min));
  const [error, setError] = useState<string | null>(null);
  const [confirmBuyNow, setConfirmBuyNow] = useState(false);

  const current = Number(value);
  const atMin = !Number.isFinite(current) || current <= min;

  const currentBid = override?.amount ?? vehicle.current_bid ?? vehicle.starting_bid;
  const buyNow = vehicle.buy_now_price;
  const canBuyNow = buyNow !== null && buyNow > currentBid;

  function buyNowNow() {
    if (buyNow === null) return;
    try {
      placeBid(vehicle.id, buyNow, vehicle.bid_count);
      setError(null);
      setConfirmBuyNow(false);
      setValue(String(buyNow + BID_INCREMENT));
      toast(tm.boughtNow(vehicle, buyNow), "success");
    } catch {
      setError(tm.buyNowFailed);
    }
  }

  function step(delta: number) {
    const base = Number.isFinite(current) ? current : min;
    setValue(String(Math.max(min, base + delta)));
    if (error) setError(null);
  }

  function place(amount: number) {
    if (!Number.isFinite(amount) || amount < min) {
      setError(t("enterAtLeast", { amount: fmt.currency(min) }));
      return;
    }
    try {
      placeBid(vehicle.id, amount, vehicle.bid_count);
      setError(null);
      setValue(String(amount + BID_INCREMENT));
      toast(tm.bidPlaced(vehicle, amount), "success");
    } catch {
      setError(tm.bidFailed);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-stretch gap-2">
        <div
          className={cn(
            "relative flex min-w-0 flex-1 items-center rounded-xl border bg-surface transition focus-within:ring-2 focus-within:ring-primary-500/30",
            error
              ? "border-error"
              : "border-line hover:border-line-strong focus-within:border-primary-500",
          )}
        >
          <span className="pl-3 text-sm text-ink-subtle">$</span>
          <input
            type="number"
            inputMode="numeric"
            min={min}
            step={BID_INCREMENT}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            aria-label={t("yourBidAmount")}
            aria-invalid={Boolean(error)}
            className="w-full min-w-0 bg-transparent py-2 pl-1.5 pr-1 text-sm font-medium text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="flex flex-col self-stretch border-l border-line">
            <button
              type="button"
              onClick={() => step(BID_INCREMENT)}
              aria-label={t("increaseBy", { amount: fmt.currency(BID_INCREMENT) })}
              className="flex flex-1 cursor-pointer items-center justify-center px-2 text-ink-subtle transition hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:hover:bg-neutral-800"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m18 15-6-6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => step(-BID_INCREMENT)}
              disabled={atMin}
              aria-label={t("decreaseBy", { amount: fmt.currency(BID_INCREMENT) })}
              className="flex flex-1 cursor-pointer items-center justify-center border-t border-line px-2 text-ink-subtle transition hover:bg-neutral-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-neutral-800"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>
        <Button onClick={() => place(current)} className="flex-1 lg:flex-none">
          {t("placeBid")}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink-subtle">{t("minimum", { amount: fmt.currency(min) })}</p>
      )}

      {canBuyNow &&
        (confirmBuyNow ? (
          <div className="mt-1 flex items-center gap-2">
            <Button onClick={buyNowNow} className="flex-1">
              {t("confirmBuyAt", { amount: fmt.currency(buyNow) })}
            </Button>
            <Button variant="secondary" onClick={() => setConfirmBuyNow(false)}>
              {t("cancel")}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setConfirmBuyNow(true)}
            className="mt-1 w-full"
          >
            {t("buyItNow", { amount: fmt.currency(buyNow) })}
          </Button>
        ))}
    </div>
  );
}
