import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Static white surface. Cards are always bg-surface — never gray. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
