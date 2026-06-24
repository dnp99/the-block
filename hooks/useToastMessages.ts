"use client";

import { useTranslations } from "next-intl";
import type { Vehicle } from "@/lib/contracts/vehicle";
import { vehicleTitle } from "@/lib/format";
import { useFormat } from "@/hooks/useFormat";

type TitleInput = Pick<Vehicle, "year" | "make" | "model">;
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
