import Link from "next/link";
import { GraduationCap, Users2 } from "lucide-react";

import { getVerificationDetail } from "@/lib/queries/verifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScreenshotViewer } from "@/components/payments/screenshot-viewer";
import { VerificationActions } from "@/components/payments/verification-actions";
import { InstallmentStatusBadge } from "@/components/installments/installment-status-badge";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const STATUS_MAP = {
  pending: "pending_verification",
  approved: "paid",
  rejected: "rejected",
  reupload_requested: "pending",
} as const;

interface PageProps {
  params: Promise<{ paymentId: string }>;
}

export default async function VerificationDetailPage({ params }: PageProps) {
  const { paymentId } = await params;
  const detail = await getVerificationDetail(paymentId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link href="/admin/verifications" className="text-sm text-muted-foreground hover:underline">
          ← Back to verifications
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{detail.studentName}</h1>
          <InstallmentStatusBadge status={STATUS_MAP[detail.verificationStatus]} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{detail.studentCode}</span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="size-3.5" />
            {detail.course}
          </span>
          <span className="flex items-center gap-1.5">
            <Users2 className="size-3.5" />
            {detail.batch}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment screenshot</CardTitle>
          </CardHeader>
          <CardContent>
            <ScreenshotViewer screenshotPath={detail.screenshotPath} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Installment</span>
              <span className="font-medium">{detail.installmentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-medium">{formatCurrency(detail.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-medium">{detail.transactionId ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Submitted</span>
              <span className="font-medium">{formatDateTime(detail.createdAt)}</span>
            </div>
            {detail.note && (
              <div className="flex flex-col gap-1 rounded-lg bg-muted p-3">
                <span className="text-xs text-muted-foreground">Student note</span>
                <span>{detail.note}</span>
              </div>
            )}
            {detail.remarks && (
              <div className="flex flex-col gap-1 rounded-lg bg-muted p-3">
                <span className="text-xs text-muted-foreground">Previous admin remarks</span>
                <span>{detail.remarks}</span>
              </div>
            )}

            {detail.verificationStatus === "pending" && (
              <div className="pt-2">
                <VerificationActions paymentId={detail.id} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
