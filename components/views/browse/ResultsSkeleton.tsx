import { Skeleton } from "@/components/shared/Skeleton";
export function ResultsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-2xl border border-line bg-surface p-3 sm:gap-5 sm:p-4"
        >
          <Skeleton className="aspect-[4/3] w-28 shrink-0 rounded-xl sm:aspect-auto sm:min-h-44 sm:w-60" />
          <div className="flex flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-auto flex items-end justify-between border-t border-line pt-2.5">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
