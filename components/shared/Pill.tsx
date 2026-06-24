import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
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

const outlineTones: Record<PillTone, string> = {
  neutral: "border-line text-ink-muted",
  blue: "border-primary-300 text-primary-700 dark:border-primary-800 dark:text-primary-300",
  green: "border-success/40 text-success",
  amber: "border-warning/50 text-warning",
  red: "border-error/40 text-error",
};

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: PillTone;
  variant?: "soft" | "outline";
}

export function Pill({ tone = "neutral", variant = "soft", className, ...props }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
        variant === "outline"
          ? cn("border bg-surface", outlineTones[tone])
          : tones[tone],
        className,
      )}
      {...props}
    />
  );
}
