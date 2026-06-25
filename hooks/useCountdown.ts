"use client";

import { useTranslations } from "next-intl";
import { countdownParts, type AuctionState } from "@/lib/auction";
export function useCountdownLabel() {
  const tAuction = useTranslations("auction");
  return (state: AuctionState, nowMs: number): string => {
    const parts = countdownParts(state, nowMs);
    if (parts.phase === "ended") return tAuction("ended");
    let value: string;
    if (parts.d > 0) value = `${tAuction("d", { n: parts.d })} ${tAuction("h", { n: parts.h })}`;
    else if (parts.h > 0) value = `${tAuction("h", { n: parts.h })} ${tAuction("m", { n: parts.m })}`;
    else if (parts.m > 0) value = `${tAuction("m", { n: parts.m })} ${tAuction("s", { n: parts.s })}`;
    else value = tAuction("s", { n: parts.s });
    return parts.phase === "live" ? tAuction("endsIn", { value }) : tAuction("startsIn", { value });
  };
}
export function useCountdownBadge() {
  const tAuction = useTranslations("auction");
  return (state: AuctionState, nowMs: number): string => {
    const parts = countdownParts(state, nowMs);
    if (parts.phase === "ended") return tAuction("auctionOver");
    const value =
      parts.d > 0
        ? tAuction("d", { n: parts.d })
        : parts.h > 0
          ? tAuction("h", { n: parts.h })
          : parts.m > 0
            ? tAuction("m", { n: parts.m })
            : tAuction("s", { n: parts.s });
    return parts.phase === "live" ? tAuction("leftCompact", { value }) : tAuction("startsIn", { value });
  };
}
