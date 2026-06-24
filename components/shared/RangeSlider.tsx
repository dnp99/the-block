"use client";

import * as Slider from "@radix-ui/react-slider";
export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onValueChange,
  format = (n) => String(n),
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (v: [number, number]) => void;
  format?: (n: number) => string;
}) {
  const [lo, hi] = value;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-xs tabular-nums text-ink-muted">
          {format(lo)} – {format(hi)}
        </span>
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        min={min}
        max={max}
        step={step}
        value={value}
        minStepsBetweenThumbs={1}
        onValueChange={(v) => onValueChange([v[0], v[1]])}
        aria-label={label}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-neutral-200 dark:bg-neutral-700">
          <Slider.Range className="absolute h-full rounded-full bg-primary-600" />
        </Slider.Track>
        {[0, 1].map((i) => (
          <Slider.Thumb
            key={i}
            aria-label={`${label} ${i === 0 ? "minimum" : "maximum"}`}
            className="block h-4 w-4 rounded-full border-2 border-primary-600 bg-surface shadow-sm transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          />
        ))}
      </Slider.Root>
    </div>
  );
}
