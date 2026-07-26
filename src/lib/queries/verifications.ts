import "server-only";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PaymentVerificationStatus } from "@/lib/db/types";

export interface VerificationListItem {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  installmentName: string;
  amount: number;
  transactionId: string | null;
  createdAt: string;
  verificationStatus: PaymentVerificationStatus;
}

export async function getPendingVerifications(): Promise<VerificationListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, amount, transaction_id, created_at, verification_status, students(id, name, student_code), installments!installment_id(installment_name)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    studentId: row.students!.id,
    studentName: row.students!.name,
    studentCode: row.students!.student_code,
    installmentName: row.installments?.installment_name ?? "—",
    amount: row.amount,
    transactionId: row.transaction_id,
    createdAt: row.created_at,
    verificationStatus: row.verification_status,
  }));
}

export interface VerificationDetail {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  course: string;
  batch: string;
  installmentId: string;
  installmentName: string;
  amount: number;
  transactionId: string | null;
  note: string | null;
  screenshotPath: string | null;
  verificationStatus: PaymentVerificationStatus;
  remarks: string | null;
  createdAt: string;
}

export async function getVerificationDetail(paymentId: string): Promise<VerificationDetail> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, amount, transaction_id, note, screenshot_path, verification_status, remarks, created_at, installment_id, students(id, name, student_code, course, batch), installments!installment_id(installment_name)"
    )
    .eq("id", paymentId)
    .single();

  if (error || !data) notFound();

  return {
    id: data.id,
    studentId: data.students!.id,
    studentName: data.students!.name,
    studentCode: data.students!.student_code,
    course: data.students!.course,
    batch: data.students!.batch,
    installmentId: data.installment_id,
    installmentName: data.installments?.installment_name ?? "—",
    amount: data.amount,
    transactionId: data.transaction_id,
    note: data.note,
    screenshotPath: data.screenshot_path,
    verificationStatus: data.verification_status,
    remarks: data.remarks,
    createdAt: data.created_at,
  };
}
