"use client";

import { useTranslations } from "next-intl";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { vehicleTitle } from "@/lib/format";
import { useFormat } from "@/lib/useFormat";

type TitleInput = Pick<Vehicle, "year" | "make" | "model">;

/*
  Localized toast / inline-error copy. Replaces the old static lib/toasts.ts so
  the browse list and the VDP say the same thing in the active language, with the
  amount formatted for the locale and the vehicle named.
*/
export function useToastMessages() {
  const t = useTranslations("toasts");
  const fmt = useFormat();
  return {
    bidPlaced: (v: TitleInput, amount: number) =>
      t("bidPlaced", { amount: fmt.currency(amount), vehicle: vehicleTitle(v) }),
    bidFailed: t("bidFailed"),
    boughtNow: (v: TitleInput, amount: number) =>
      t("boughtNow", { amount: fmt.currency(amount), vehicle: vehicleTitle(v) }),
    buyNowFailed: t("buyNowFailed"),
    aiSearchUnavailable: t("aiSearchUnavailable"),
    aiSummaryUnavailable: t("aiSummaryUnavailable"),
  };
}
