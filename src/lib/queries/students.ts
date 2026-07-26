import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { InstallmentStatus } from "@/lib/db/types";

export type StudentPaymentStatus =
  | "completed"
  | "pending"
  | "pending_verification"
  | "overdue"
  | "no_plan";

export type PaymentStatusFilter = "all" | StudentPaymentStatus;

export interface StudentListItem {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string | null;
  course: string;
  batch: string;
  originalFee: number;
  scholarship: number;
  finalFee: number;
  createdAt: string;
  paymentStatus: StudentPaymentStatus;
  paidAmount: number;
}

export interface StudentListFilters {
  search?: string;
  batch?: string;
  course?: string;
  paymentStatus?: PaymentStatusFilter;
  page?: number;
  pageSize?: number;
}

function computePaymentStatus(
  installments: { status: InstallmentStatus; due_date: string; amount: number }[]
): { status: StudentPaymentStatus; paidAmount: number } {
  const paidAmount = installments
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  if (installments.length === 0) return { status: "no_plan", paidAmount };

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = (i: { status: InstallmentStatus; due_date: string }) =>
    i.status === "overdue" || ((i.status === "pending" || i.status === "pending_verification") && i.due_date < today);

  if (installments.some(isOverdue)) return { status: "overdue", paidAmount };
  if (installments.every((i) => i.status === "paid")) return { status: "completed", paidAmount };
  if (installments.some((i) => i.status === "pending_verification")) {
    return { status: "pending_verification", paidAmount };
  }
  return { status: "pending", paidAmount };
}

// Text/batch/course filters run at the DB level. Payment-status filtering depends on an
// aggregate over each student's installments, so (given the scale this app targets -- a few
// hundred students, not millions) it's computed in application code after fetching every
// matching student, then paginated in memory. Simpler and correct; revisit with a SQL view
// if the student count ever grows large enough for this to matter.
export async function getStudentList(filters: StudentListFilters): Promise<{
  students: StudentListItem[];
  total: number;
  batches: string[];
  courses: string[];
}> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;

  let query = supabase
    .from("students")
    .select("id, student_code, name, email, phone, course, batch, original_fee, scholarship, final_fee, created_at, installments(status, due_date, amount)")
    .order("created_at", { ascending: false });

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `name.ilike.%${term}%,email.ilike.%${term}%,student_code.ilike.%${term}%`
    );
  }
  if (filters.batch && filters.batch !== "all") query = query.eq("batch", filters.batch);
  if (filters.course && filters.course !== "all") query = query.eq("course", filters.course);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const [{ data: batchRows }, { data: courseRows }] = await Promise.all([
    supabase.from("students").select("batch"),
    supabase.from("students").select("course"),
  ]);
  const batches = Array.from(new Set((batchRows ?? []).map((r) => r.batch))).sort();
  const courses = Array.from(new Set((courseRows ?? []).map((r) => r.course))).sort();

  let mapped: StudentListItem[] = (data ?? []).map((row) => {
    const { status, paidAmount } = computePaymentStatus(row.installments ?? []);
    return {
      id: row.id,
      studentCode: row.student_code,
      name: row.name,
      email: row.email,
      phone: row.phone,
      course: row.course,
      batch: row.batch,
      originalFee: row.original_fee,
      scholarship: row.scholarship,
      finalFee: row.final_fee,
      createdAt: row.created_at,
      paymentStatus: status,
      paidAmount,
    };
  });

  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    mapped = mapped.filter((s) => s.paymentStatus === filters.paymentStatus);
  }

  const total = mapped.length;
  const start = (page - 1) * pageSize;
  const students = mapped.slice(start, start + pageSize);

  return { students, total, batches, courses };
}
