import { AlertTriangle, Calendar, GraduationCap, Users2, Wallet } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/roles";
import { getMyInstallments, getMyStudentRecord } from "@/lib/queries/student-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { InstallmentProgressBar } from "@/components/dashboard/progress-bar";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function StudentDashboardPage() {
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
  const paidAmount = installments.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const completedCount = installments.filter((i) => i.status === "paid").length;
  const remaining = student.finalFee - paidAmount;
  const nextDue = installments.find((i) => i.status === "pending" || i.status === "rejected");

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="flex flex-col gap-1 py-2">
          <span className="text-sm opacity-80">Welcome back,</span>
          <span className="text-2xl font-semibold">{student.name}</span>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-90">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-3.5" />
              {student.course}
            </span>
            <span className="flex items-center gap-1.5">
              <Users2 className="size-3.5" />
              {student.batch}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1 py-2">
            <span className="text-xs font-medium text-muted-foreground">Course fee</span>
            <span className="text-lg font-semibold">{formatCurrency(student.finalFee)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-2">
            <span className="text-xs font-medium text-muted-foreground">Amount paid</span>
            <span className="text-lg font-semibold text-success">{formatCurrency(paidAmount)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <InstallmentProgressBar completed={completedCount} total={installments.length} />
          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
            <Wallet className="size-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Remaining balance</span>
              <span className="font-semibold">{formatCurrency(Math.max(0, remaining))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {nextDue && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming due date</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-muted-foreground" />
            <span className="font-medium">{nextDue.installmentName}</span>
            <span className="text-muted-foreground">
              — {formatCurrency(nextDue.amount)} due {formatDate(nextDue.dueDate)}
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
