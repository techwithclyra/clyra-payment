import Link from "next/link";
import { Lock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InstallmentStatusBadge } from "@/components/installments/installment-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { InstallmentRow } from "@/lib/queries/student-detail";

export function InstallmentCard({ installment, payable }: { installment: InstallmentRow; payable: boolean }) {
  const locked = installment.status === "locked";

  return (
    <Card className={locked ? "opacity-60" : undefined}>
      <CardContent className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {locked && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Lock className="size-4 text-muted-foreground" />
            </span>
          )}
          <div className="flex flex-col">
            <span className="font-medium">{installment.installmentName}</span>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(installment.amount)} · Due {formatDate(installment.dueDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <InstallmentStatusBadge status={installment.effectiveStatus} />
          {payable && (
            <Button asChild size="sm">
              <Link href={`/installments/${installment.id}/pay`}>Pay Now</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
