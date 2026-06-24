"use client";

import { useState } from "react";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { cn } from "@/lib/cn";

export function VehicleGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const safeActive = Math.min(active, Math.max(0, images.length - 1));

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-neutral-100 dark:bg-neutral-800 sm:aspect-video">
        <VehicleImage
          src={images[safeActive]}
          alt={`${alt} — photo ${safeActive + 1}`}
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {images.length > 0 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-neutral-900/70 px-2 py-0.5 text-xs font-medium text-white">
            {safeActive + 1} / {images.length}
          </span>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === safeActive}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-neutral-100 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-neutral-800",
                i === safeActive
                  ? "border-primary-600"
                  : "border-transparent hover:border-line-strong",
              )}
            >
              <VehicleImage src={src} alt={`${alt} thumbnail ${i + 1}`} sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
