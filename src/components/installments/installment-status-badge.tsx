import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DisplayStatus =
  | "locked"
  | "pending"
  | "pending_verification"
  | "paid"
  | "overdue"
  | "rejected"
  | "completed"
  | "no_plan";

const STATUS_META: Record<DisplayStatus, { label: string; className: string }> = {
  locked: { label: "Locked", className: "bg-muted text-muted-foreground" },
  pending: { label: "Pending", className: "bg-secondary text-secondary-foreground" },
  pending_verification: { label: "Awaiting verification", className: "bg-warning/15 text-warning" },
  paid: { label: "Paid", className: "bg-success/15 text-success" },
  completed: { label: "Completed", className: "bg-success/15 text-success" },
  overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive" },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive" },
  no_plan: { label: "No plan yet", className: "bg-muted text-muted-foreground" },
};

export function InstallmentStatusBadge({ status, className }: { status: DisplayStatus; className?: string }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <Badge variant="secondary" className={cn("font-medium", meta.className, className)}>
      {meta.label}
    </Badge>
  );
}
