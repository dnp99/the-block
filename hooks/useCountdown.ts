"use client";

import { useTranslations } from "next-intl";
import { countdownParts, type AuctionState } from "@/lib/auction";

/*
  i18n countdown label, e.g. "Ends in 12m 4s" / "Se termine dans 12 min 4 s".
  Time math stays pure in countdownParts; this hook only does the wording.
*/
export function useCountdownLabel() {
  const t = useTranslations("auction");
  return (state: AuctionState, nowMs: number): string => {
    const p = countdownParts(state, nowMs);
    if (p.phase === "ended") return t("ended");
    let value: string;
    if (p.d > 0) value = `${t("d", { n: p.d })} ${t("h", { n: p.h })}`;
    else if (p.h > 0) value = `${t("h", { n: p.h })} ${t("m", { n: p.m })}`;
    else if (p.m > 0) value = `${t("m", { n: p.m })} ${t("s", { n: p.s })}`;
    else value = t("s", { n: p.s });
    return p.phase === "live" ? t("endsIn", { value }) : t("startsIn", { value });
  };
}

/*
  Compact countdown for the thumbnail badge, single largest unit:
  live → "2h left", upcoming → "Starts in 2h", ended → "Auction over".
*/
export function useCountdownBadge() {
  const t = useTranslations("auction");
  return (state: AuctionState, nowMs: number): string => {
    const p = countdownParts(state, nowMs);
    if (p.phase === "ended") return t("auctionOver");
    const value =
      p.d > 0
        ? t("d", { n: p.d })
        : p.h > 0
          ? t("h", { n: p.h })
          : p.m > 0
            ? t("m", { n: p.m })
            : t("s", { n: p.s });
    return p.phase === "live" ? t("leftCompact", { value }) : t("startsIn", { value });
  };
}
