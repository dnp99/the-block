"use client";

import Link from "next/link";
import { resetBrowse } from "@/lib/browseState";

export function BrandLink() {
  return (
    <Link
      href="/"
      onClick={resetBrowse}
      className="text-ink focus-visible:ring-primary-500 flex items-center gap-2 rounded-xl font-semibold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
    >
      <span
        aria-hidden
        className="bg-primary-600 grid h-7 w-7 place-items-center rounded-xl text-sm font-bold text-white"
      >
        O
      </span>
      Openlane
    </Link>
  );
}
