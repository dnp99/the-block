"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { BID_INCREMENT, minimumBid, placeBid, useBidOverrides } from "@/lib/bids";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { formatCurrency } from "@/lib/format";

export function BidForm({ vehicle }: { vehicle: Vehicle }) {
  const overrides = useBidOverrides();
  const override = overrides[vehicle.id];
  const min = minimumBid(vehicle, override);
  const hasBids = (override?.amount ?? vehicle.current_bid) !== null;

  const [value, setValue] = useState(String(min));
  const [error, setError] = useState<string | null>(null);

  function place(amount: number) {
    if (!Number.isFinite(amount) || amount < min) {
      setError(`Enter at least ${formatCurrency(min)}`);
      return;
    }
    try {
      placeBid(vehicle.id, amount, vehicle.bid_count);
      setError(null);
      setValue(String(amount + BID_INCREMENT));
    } catch {
      setError("Couldn’t place your bid, please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-stretch gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-subtle">
            $
          </span>
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
            aria-label="Your bid amount"
            aria-invalid={Boolean(error)}
            className={cn(
              "w-full rounded-xl border bg-surface py-2 pl-7 pr-3 text-sm font-medium text-ink outline-none transition focus-visible:ring-2 focus-visible:ring-primary-500/30 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none",
              error
                ? "border-error focus-visible:border-error"
                : "border-line hover:border-line-strong focus-visible:border-primary-500",
            )}
          />
        </div>
        <Button onClick={() => place(Number(value))}>Place bid</Button>
        <Button
          variant="secondary"
          onClick={() => place(min)}
          title={`Bid ${formatCurrency(min)}`}
        >
          {hasBids ? `+$${BID_INCREMENT}` : "Open bid"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs font-medium text-error">
          {error}
        </p>
      ) : (
        <p className="text-xs text-ink-subtle">
          Minimum bid {formatCurrency(min)}
        </p>
      )}
    </div>
  );
}
