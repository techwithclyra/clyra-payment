import { AlertTriangle } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/roles";
import { getMyPayments, getMyStudentRecord } from "@/lib/queries/student-portal";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { EmptyState } from "@/components/layout/empty-state";

export default async function StudentPaymentsPage() {
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

  const payments = await getMyPayments(student.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payment History</h1>
        <p className="text-sm text-muted-foreground">All your submitted payments and receipts.</p>
      </div>
      <PaymentHistoryTable payments={payments} showReceiptLink />
    </div>
  );
}
