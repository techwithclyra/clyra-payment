"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import {
  addInstallmentSchema,
  createInstallmentPlanSchema,
  markInstallmentStatusSchema,
  updateInstallmentSchema,
} from "@/lib/validations/installment.schema";

export interface InstallmentActionResult {
  success: boolean;
  error?: string;
}

export async function createInstallmentPlan(input: unknown): Promise<InstallmentActionResult> {
  await requireRole("admin");

  const parsed = createInstallmentPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { studentId, installments } = parsed.data;

  const supabase = await createClient();

  const { count } = await supabase
    .from("installments")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId);

  if (count && count > 0) {
    return { success: false, error: "This student already has an installment plan" };
  }

  // Every installment is payable immediately -- no sequential locking. Students can pay any
  // or all installments in any order; nothing waits on a prior one being approved first.
  const rows = installments.map((row, index) => ({
    student_id: studentId,
    installment_name: row.installmentName,
    amount: row.amount,
    due_date: row.dueDate,
    sequence_no: index + 1,
    status: "pending" as const,
  }));

  const { error } = await supabase.from("installments").insert(rows);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

export async function addInstallment(input: unknown): Promise<InstallmentActionResult> {
  await requireRole("admin");

  const parsed = addInstallmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { studentId, installmentName, amount, dueDate } = parsed.data;

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("installments")
    .select("sequence_no")
    .eq("student_id", studentId)
    .order("sequence_no", { ascending: false })
    .limit(1);

  const nextSeq = (existing?.[0]?.sequence_no ?? 0) + 1;

  const { error } = await supabase.from("installments").insert({
    student_id: studentId,
    installment_name: installmentName,
    amount,
    due_date: dueDate,
    sequence_no: nextSeq,
    status: "pending",
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

export async function updateInstallment(input: unknown): Promise<InstallmentActionResult> {
  await requireRole("admin");

  const parsed = updateInstallmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { installmentId, installmentName, amount, dueDate } = parsed.data;

  const supabase = await createClient();
  const { data: installment, error } = await supabase
    .from("installments")
    .update({ installment_name: installmentName, amount, due_date: dueDate })
    .eq("id", installmentId)
    .select("student_id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/students/${installment.student_id}`);
  return { success: true };
}

export async function deleteInstallment(installmentId: string): Promise<InstallmentActionResult> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data: installment } = await supabase
    .from("installments")
    .select("student_id, status")
    .eq("id", installmentId)
    .single();

  if (!installment) {
    return { success: false, error: "Installment not found" };
  }
  if (installment.status === "paid" || installment.status === "pending_verification") {
    return {
      success: false,
      error: "Cannot delete an installment that is paid or awaiting verification",
    };
  }

  const { error } = await supabase.from("installments").delete().eq("id", installmentId);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/students/${installment.student_id}`);
  return { success: true };
}

// Manual admin override (spec: "Mark Paid / Mark Pending / Mark Overdue"). Marking an
// installment 'paid' this way bypasses the normal payment-approval flow, so it must also
// replicate the "unlock the next installment" side effect that the payments trigger would
// otherwise provide -- that invariant should hold no matter how an installment becomes paid.
export async function markInstallmentStatus(input: unknown): Promise<InstallmentActionResult> {
  await requireRole("admin");

  const parsed = markInstallmentStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { installmentId, status } = parsed.data;

  const supabase = await createClient();
  const { data: installment, error } = await supabase
    .from("installments")
    .update({ status })
    .eq("id", installmentId)
    .select("student_id, sequence_no")
    .single();

  if (error || !installment) {
    return { success: false, error: error?.message ?? "Installment not found" };
  }

  if (status === "paid") {
    await supabase
      .from("installments")
      .update({ status: "pending" })
      .eq("student_id", installment.student_id)
      .eq("sequence_no", installment.sequence_no + 1)
      .eq("status", "locked");
  }

  revalidatePath(`/admin/students/${installment.student_id}`);
  return { success: true };
}
