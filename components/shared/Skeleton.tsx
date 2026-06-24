import { cn } from "@/lib/cn";
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-[skeleton-pulse_1.5s_ease-in-out_infinite] rounded-md bg-neutral-200 dark:bg-neutral-800",
        className,
      )}
    />
  );
}
