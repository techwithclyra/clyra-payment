import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ExportScope = "students" | "installments" | "payments";

export interface ExportTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export async function getExportTable(scope: ExportScope): Promise<ExportTable> {
  const supabase = await createClient();

  if (scope === "students") {
    const { data } = await supabase
      .from("students")
      .select("student_code, name, email, phone, course, batch, joining_date, final_fee")
      .order("created_at", { ascending: false });

    return {
      title: "Students",
      headers: ["Student ID", "Name", "Email", "Phone", "Course", "Batch", "Joining Date", "Fee"],
      rows: (data ?? []).map((s) => [
        s.student_code,
        s.name,
        s.email,
        s.phone ?? "",
        s.course,
        s.batch,
        s.joining_date,
        s.final_fee,
      ]),
    };
  }

  if (scope === "installments") {
    const { data } = await supabase
      .from("installments_with_effective_status")
      .select("installment_name, amount, due_date, effective_status, students(student_code, name)")
      .order("due_date", { ascending: true });

    return {
      title: "Installments",
      headers: ["Student ID", "Student Name", "Installment", "Amount", "Due Date", "Status"],
      rows: (data ?? []).map((i) => [
        i.students?.student_code ?? "",
        i.students?.name ?? "",
        i.installment_name,
        i.amount,
        i.due_date,
        i.effective_status,
      ]),
    };
  }

  const { data } = await supabase
    .from("payments")
    .select("amount, transaction_id, verification_status, created_at, verified_at, students(student_code, name), installments!installment_id(installment_name)")
    .order("created_at", { ascending: false });

  return {
    title: "Payments",
    headers: ["Student ID", "Student Name", "Installment", "Amount", "Transaction ID", "Status", "Submitted", "Verified"],
    rows: (data ?? []).map((p) => [
      p.students?.student_code ?? "",
      p.students?.name ?? "",
      p.installments?.installment_name ?? "",
      p.amount,
      p.transaction_id ?? "",
      p.verification_status,
      p.created_at,
      p.verified_at ?? "",
    ]),
  };
}
