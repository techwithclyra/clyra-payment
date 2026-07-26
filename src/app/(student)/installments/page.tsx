import { AlertTriangle } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/roles";
import { getMyInstallments, getMyStudentRecord } from "@/lib/queries/student-portal";
import { InstallmentCard } from "@/components/installments/installment-card";
import { EmptyState } from "@/components/layout/empty-state";

export default async function StudentInstallmentsPage() {
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

  if (installments.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No installment plan yet"
        description="Your fee plan hasn't been set up yet. Please check back soon or contact Clyra support."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Installments</h1>
        <p className="text-sm text-muted-foreground">
          Only the current due installment can be paid; the rest unlock as each is approved.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {installments.map((installment) => (
          <InstallmentCard
            key={installment.id}
            installment={installment}
            payable={installment.status === "pending" || installment.status === "rejected"}
          />
        ))}
      </div>
    </div>
  );
}
