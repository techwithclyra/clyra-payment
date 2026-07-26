import { Progress } from "@/components/ui/progress";

export function InstallmentProgressBar({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Payment progress</span>
        <span className="text-muted-foreground">
          {completed} of {total} installment{total === 1 ? "" : "s"} completed
        </span>
      </div>
      <Progress value={pct} />
    </div>
  );
}
