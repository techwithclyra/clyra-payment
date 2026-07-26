import { NewPlanBuilder } from "@/components/installments/new-plan-builder";
import { InstallmentPlanList } from "@/components/installments/installment-plan-list";
import type { InstallmentRow } from "@/lib/queries/student-detail";

export function InstallmentPlanEditor({
  studentId,
  installments,
}: {
  studentId: string;
  installments: InstallmentRow[];
}) {
  if (installments.length === 0) {
    return <NewPlanBuilder studentId={studentId} />;
  }

  return <InstallmentPlanList studentId={studentId} installments={installments} />;
}
