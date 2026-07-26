import Link from "next/link";
import { Pencil, Mail, Phone, Calendar, GraduationCap, Users2 } from "lucide-react";

import {
  getStudentDetail,
  getStudentInstallments,
  getStudentPayments,
} from "@/lib/queries/student-detail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstallmentPlanEditor } from "@/components/installments/installment-plan-editor";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentDetailPage({ params }: PageProps) {
  const { studentId } = await params;
  const [student, installments, payments] = await Promise.all([
    getStudentDetail(studentId),
    getStudentInstallments(studentId),
    getStudentPayments(studentId),
  ]);

  const paidAmount = installments
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{student.studentCode}</p>
          <h1 className="text-2xl font-semibold tracking-tight">{student.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5" />
              {student.email}
            </span>
            {student.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {student.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-3.5" />
              {student.course}
            </span>
            <span className="flex items-center gap-1.5">
              <Users2 className="size-3.5" />
              {student.batch}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              Joined {formatDate(student.joiningDate)}
            </span>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/admin/students/${student.id}/edit`}>
            <Pencil className="size-4" />
            Edit
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-1 py-2">
            <span className="text-xs font-medium text-muted-foreground">Course fee</span>
            <span className="text-lg font-semibold">{formatCurrency(student.finalFee)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-1 py-2">
            <span className="text-xs font-medium text-muted-foreground">Paid so far</span>
            <span className="text-lg font-semibold">{formatCurrency(paidAmount)}</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="installments">
        <TabsList>
          <TabsTrigger value="installments">Installments</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>
        <TabsContent value="installments" className="pt-4">
          <InstallmentPlanEditor studentId={student.id} installments={installments} />
        </TabsContent>
        <TabsContent value="payments" className="pt-4">
          <PaymentHistoryTable payments={payments} verifyHrefPrefix="/admin/verifications" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
