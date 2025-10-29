import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const CardStatsSkeleton = () => {
  return (
    <Card className="flex items-center justify-between gap-4 p-4 rounded-lg bg-[#F8F8F8] shadow-none border-none">
      <CardContent className="flex flex-row justify-center items-center gap-4 w-full">
        <div className="flex flex-row justify-center items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="w-full">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CardStatsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <CardStatsSkeleton />
      <CardStatsSkeleton />
      <CardStatsSkeleton />
    </div>
  );
};
