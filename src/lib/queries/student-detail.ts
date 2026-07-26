import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { InstallmentStatus, PaymentVerificationStatus } from "@/lib/db/types";

export interface StudentDetail {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone: string | null;
  course: string;
  batch: string;
  joiningDate: string;
  originalFee: number;
  scholarship: number;
  finalFee: number;
  createdAt: string;
}

export interface InstallmentRow {
  id: string;
  installmentName: string;
  amount: number;
  dueDate: string;
  sequenceNo: number;
  status: InstallmentStatus;
  effectiveStatus: InstallmentStatus;
  currentPaymentId: string | null;
}

export interface PaymentRow {
  id: string;
  installmentId: string;
  installmentName: string;
  amount: number;
  transactionId: string | null;
  screenshotPath: string | null;
  note: string | null;
  verificationStatus: PaymentVerificationStatus;
  remarks: string | null;
  createdAt: string;
  verifiedAt: string | null;
}

export async function getStudentDetail(studentId: string): Promise<StudentDetail> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", studentId)
    .single();

  if (error || !data) notFound();

  return {
    id: data.id,
    studentCode: data.student_code,
    name: data.name,
    email: data.email,
    phone: data.phone,
    course: data.course,
    batch: data.batch,
    joiningDate: data.joining_date,
    originalFee: data.original_fee,
    scholarship: data.scholarship,
    finalFee: data.final_fee,
    createdAt: data.created_at,
  };
}

export async function getStudentInstallments(studentId: string): Promise<InstallmentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("installments_with_effective_status")
    .select("*")
    .eq("student_id", studentId)
    .order("sequence_no", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    installmentName: row.installment_name,
    amount: row.amount,
    dueDate: row.due_date,
    sequenceNo: row.sequence_no,
    status: row.status,
    effectiveStatus: row.effective_status,
    currentPaymentId: row.current_payment_id,
  }));
}

export async function getStudentPayments(studentId: string): Promise<PaymentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*, installments!installment_id(installment_name)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    installmentId: row.installment_id,
    installmentName: row.installments?.installment_name ?? "—",
    amount: row.amount,
    transactionId: row.transaction_id,
    screenshotPath: row.screenshot_path,
    note: row.note,
    verificationStatus: row.verification_status,
    remarks: row.remarks,
    createdAt: row.created_at,
    verifiedAt: row.verified_at,
  }));
}
