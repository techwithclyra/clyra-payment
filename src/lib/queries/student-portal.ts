import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { StudentDetail, InstallmentRow, PaymentRow } from "@/lib/queries/student-detail";

// The signed-in student's own record, resolved via their auth user id (RLS scopes this to
// exactly one row -- their own -- regardless of what's requested).
export async function getMyStudentRecord(userId: string): Promise<StudentDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;

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

export async function getMyInstallments(studentId: string): Promise<InstallmentRow[]> {
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

export async function getMyPayments(studentId: string): Promise<PaymentRow[]> {
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
