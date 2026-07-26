import Link from "next/link";
import { Users } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/layout/empty-state";
import { InstallmentStatusBadge } from "@/components/installments/installment-status-badge";
import { StudentRowActions } from "@/components/students/student-row-actions";
import { formatCurrency } from "@/lib/utils";
import type { StudentListItem } from "@/lib/queries/students";

export function StudentTable({ students }: { students: StudentListItem[] }) {
  if (students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No students found"
        description="Try adjusting your search or filters, or add a new student to get started."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Batch / Course</TableHead>
            <TableHead className="text-right">Fee</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <Link href={`/admin/students/${student.id}`} className="flex flex-col hover:underline">
                  <span className="font-medium">{student.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {student.studentCode} · {student.email}
                  </span>
                </Link>
              </TableCell>
              <TableCell>
                <span className="text-sm">{student.batch}</span>
                <span className="block text-xs text-muted-foreground">{student.course}</span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(student.finalFee)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatCurrency(student.paidAmount)}
              </TableCell>
              <TableCell>
                <InstallmentStatusBadge status={student.paymentStatus} />
              </TableCell>
              <TableCell>
                <StudentRowActions studentId={student.id} studentName={student.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
