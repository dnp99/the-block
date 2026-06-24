import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("states");
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-3 px-4 py-24 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-2xl dark:bg-neutral-800">
        🔍
      </span>
      <h1 className="text-xl font-semibold text-ink">{t("notFoundTitle")}</h1>
      <p className="max-w-sm text-sm text-ink-muted">{t("notFoundBody")}</p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {t("backToBrowse")}
      </Link>
    </div>
  );
}
