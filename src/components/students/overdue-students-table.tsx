import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OverdueStudentRow } from "@/lib/queries/analytics";

export function OverdueStudentsTable({ rows }: { rows: OverdueStudentRow[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState icon={CheckCircle2} title="No overdue payments" description="Every student is current on their fee schedule." />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Installment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Overdue by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>
                <Link href={`/admin/students/${row.studentId}`} className="hover:underline">
                  <span className="font-medium">{row.studentName}</span>{" "}
                  <span className="text-xs text-muted-foreground">{row.studentCode}</span>
                </Link>
              </TableCell>
              <TableCell>{row.installmentName}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
              <TableCell className="text-muted-foreground">{formatDate(row.dueDate)}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="bg-destructive/15 text-destructive">
                  {row.daysOverdue} day{row.daysOverdue === 1 ? "" : "s"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
