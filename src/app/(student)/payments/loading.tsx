import { TableSkeleton } from "@/components/layout/loading-skeletons";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />
      <TableSkeleton rows={6} />
    </div>
  );
}
