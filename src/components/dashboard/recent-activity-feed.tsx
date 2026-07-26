import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { RecentActivityItem } from "@/lib/queries/admin-dashboard";

const META = {
  payment_submitted: { icon: Clock, className: "text-warning bg-warning/15", label: "submitted a payment for" },
  payment_approved: { icon: CheckCircle2, className: "text-success bg-success/15", label: "was approved for" },
  payment_rejected: { icon: XCircle, className: "text-destructive bg-destructive/15", label: "was rejected for" },
};

export function RecentActivityFeed({ items }: { items: RecentActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyState icon={Clock} title="No recent activity" description="Payment activity will appear here as students pay." />;
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => {
        const meta = META[item.type];
        const Icon = meta.icon;
        return (
          <li key={item.id} className="flex items-start gap-3">
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${meta.className}`}>
              <Icon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm">
                <span className="font-medium">{item.studentName}</span> {meta.label}{" "}
                <span className="font-medium">{item.installmentName}</span> ({formatCurrency(item.amount)})
              </p>
              <span className="text-xs text-muted-foreground">{formatDateTime(item.at)}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
