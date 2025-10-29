import { Skeleton } from "@/shared/components/ui/skeleton";

export const ChartSkeleton = () => {
  return (
    <div className="w-full space-y-4">
      {/* Chart title/header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>

      {/* Chart area skeleton */}
      <div className="w-full h-80 rounded-lg border bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="p-4 h-full flex items-end justify-center gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-32 w-8 rounded-sm" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex gap-8 justify-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
};
