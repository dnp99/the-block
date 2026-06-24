import { Skeleton } from "@/components/ui/Skeleton";

/** Loading placeholder for the results list (shown while AI search is in flight). */
export function ResultsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-2xl border border-line bg-surface p-3 sm:gap-4 sm:p-4"
        >
          <Skeleton className="aspect-[4/3] w-28 shrink-0 rounded-xl sm:w-44" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="mt-auto h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
