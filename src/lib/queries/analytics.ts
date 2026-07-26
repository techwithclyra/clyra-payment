import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MonthlyCollectionPoint {
  month: string; // "Jan 2026"
  amount: number;
}

export interface FeeStatusBreakdown {
  completed: number;
  pending: number;
  overdue: number;
}

export interface OverdueStudentRow {
  studentId: string;
  studentName: string;
  studentCode: string;
  installmentName: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

export async function getMonthlyCollection(months = 6): Promise<MonthlyCollectionPoint[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("amount, verified_at")
    .eq("verification_status", "approved")
    .not("verified_at", "is", null);

  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    buckets.set(key, 0);
  }

  for (const row of data ?? []) {
    if (!row.verified_at) continue;
    const d = new Date(row.verified_at);
    const key = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + row.amount);
    }
  }

  return Array.from(buckets.entries()).map(([month, amount]) => ({ month, amount }));
}

export async function getFeeStatusBreakdown(): Promise<FeeStatusBreakdown> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("installments_with_effective_status")
    .select("amount, status, effective_status");

  const rows = data ?? [];
  return {
    completed: rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0),
    pending: rows
      .filter((r) => r.status !== "paid" && r.status !== "locked" && r.effective_status !== "overdue")
      .reduce((s, r) => s + r.amount, 0),
    overdue: rows.filter((r) => r.effective_status === "overdue").reduce((s, r) => s + r.amount, 0),
  };
}

export async function getOverdueStudents(): Promise<OverdueStudentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("installments_with_effective_status")
    .select("amount, due_date, installment_name, students(id, name, student_code)")
    .eq("effective_status", "overdue")
    .order("due_date", { ascending: true });

  const today = new Date();
  return (data ?? []).map((row) => {
    const due = new Date(row.due_date);
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      studentId: row.students!.id,
      studentName: row.students!.name,
      studentCode: row.students!.student_code,
      installmentName: row.installment_name,
      amount: row.amount,
      dueDate: row.due_date,
      daysOverdue,
    };
  });
}
