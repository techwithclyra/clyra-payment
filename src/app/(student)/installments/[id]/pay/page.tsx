import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/roles";
import { getMyInstallments, getMyStudentRecord } from "@/lib/queries/student-portal";
import { PayNowButton } from "@/components/payments/pay-now-button";
import { ProofUploadForm } from "@/components/payments/proof-upload-form";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PayInstallmentPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const student = profile ? await getMyStudentRecord(profile.id) : null;

  if (!student) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No student record linked"
        description="Your account isn't linked to a student record yet. Please contact Clyra support."
      />
    );
  }

  const installments = await getMyInstallments(student.id);
  const installment = installments.find((i) => i.id === id);

  if (!installment) notFound();

  if (installment.status !== "pending" && installment.status !== "rejected") {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="This installment isn't payable right now"
        description="It may already be paid, awaiting verification, or still locked behind an earlier installment."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{installment.installmentName}</h1>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(installment.amount)} · Due {formatDate(installment.dueDate)}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-2">
          <p className="text-sm text-muted-foreground">
            Step 1 — Pay {formatCurrency(installment.amount)} via Google Pay using Clyra&apos;s UPI ID.
          </p>
          <PayNowButton installmentId={installment.id} />
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          Step 2 — Upload your payment proof below so an admin can verify it.
        </p>
        <ProofUploadForm installmentId={installment.id} />
      </div>
    </div>
  );
}
