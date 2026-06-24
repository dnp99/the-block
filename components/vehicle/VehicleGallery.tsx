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
  const count = images.length;
  const safeActive = Math.min(active, Math.max(0, count - 1));
  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${alt} photos`}
        tabIndex={count > 1 ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
        }}
        className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-neutral-800 sm:aspect-video"
      >
        <VehicleImage
          src={images[safeActive]}
          alt={`${alt} — photo ${safeActive + 1}`}
          sizes="(max-width: 1024px) 100vw, 60vw"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-surface/90 text-ink shadow-sm backdrop-blur transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {count > 0 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-neutral-900/70 px-2 py-0.5 text-xs font-medium text-white">
            {safeActive + 1} / {count}
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
