import { Skeleton } from "@/components/ui/skeleton";
import { StatGridSkeleton } from "@/components/layout/loading-skeletons";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      <StatGridSkeleton count={4} />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}
