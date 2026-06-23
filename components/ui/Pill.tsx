import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Color carries meaning: blue=info/selection, green=good, amber=warning, red=problem. */
export type PillTone = "neutral" | "blue" | "green" | "amber" | "red";

const tones: Record<PillTone, string> = {
  neutral:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  blue: "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200",
  green:
    "bg-success-soft text-success dark:bg-success/20 dark:text-success-soft",
  amber:
    "bg-warning-soft text-warning dark:bg-warning/20 dark:text-warning-soft",
  red: "bg-error-soft text-error dark:bg-error/20 dark:text-error-soft",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
}

export function Pill({ tone = "neutral", className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
