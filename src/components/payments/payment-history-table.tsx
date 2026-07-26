import Link from "next/link";
import { Receipt as ReceiptIcon, Download } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/layout/empty-state";
import { InstallmentStatusBadge } from "@/components/installments/installment-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { PaymentRow } from "@/lib/queries/student-detail";

const STATUS_MAP = {
  pending: "pending_verification",
  approved: "paid",
  rejected: "rejected",
  reupload_requested: "pending",
} as const;

export function PaymentHistoryTable({
  payments,
  showReceiptLink = false,
  verifyHrefPrefix,
}: {
  payments: PaymentRow[];
  showReceiptLink?: boolean;
  verifyHrefPrefix?: string;
}) {
  if (payments.length === 0) {
    return (
      <EmptyState icon={ReceiptIcon} title="No payments yet" description="Payment attempts will show up here once submitted." />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Installment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">{payment.installmentName}</TableCell>
              <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
              <TableCell className="text-muted-foreground">{payment.transactionId ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">{formatDateTime(payment.createdAt)}</TableCell>
              <TableCell>
                <InstallmentStatusBadge status={STATUS_MAP[payment.verificationStatus]} />
              </TableCell>
              <TableCell>
                {payment.verificationStatus === "approved" && showReceiptLink && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`/api/receipts/${payment.installmentId}`} download>
                      <Download className="size-4" />
                    </a>
                  </Button>
                )}
                {payment.verificationStatus === "pending" && verifyHrefPrefix && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`${verifyHrefPrefix}/${payment.id}`}>Review</Link>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
