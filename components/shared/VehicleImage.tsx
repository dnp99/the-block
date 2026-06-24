"use client";

import Image from "next/image";
import { useState } from "react";

/*
  Vehicle photo with a graceful fallback. The dataset's placeholder URLs are
  SVGs from placehold.co, which Next's image optimizer rejects by default — so
  we render them `unoptimized` (browser loads them directly). If an image still
  fails (offline, blocked), we swap to a branded tile instead of broken alt text.
*/
export function VehicleImage({
  src,
  alt,
  sizes,
}: {
  src: string | undefined;
  alt: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 p-3 text-center dark:from-neutral-800 dark:to-neutral-900">
        <span className="text-xs font-medium text-ink-subtle">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized
      onError={() => setFailed(true)}
      className="object-cover transition duration-300 group-hover:scale-[1.03]"
    />
  );
}
