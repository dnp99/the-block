"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/shared/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("states");
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-error-soft text-2xl">
        ⚠️
      </span>
      <h1 className="text-xl font-semibold text-ink">{t("errorTitle")}</h1>
      <p className="max-w-sm text-sm text-ink-muted">{t("errorBody")}</p>
      <div className="mt-2 flex gap-2">
        <Button onClick={reset}>{t("retry")}</Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/")}>
          {t("backToBrowse")}
        </Button>
      </div>
    </div>
  );
}
