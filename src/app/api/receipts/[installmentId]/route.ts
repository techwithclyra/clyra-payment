import { createClient } from "@/lib/supabase/server";
import { renderReceiptPdf } from "@/lib/pdf/receipt";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ installmentId: string }> }
) {
  const { installmentId } = await params;
  const supabase = await createClient();

  // RLS applies to this query using the caller's own session: a student can only ever
  // resolve their own installment row here, admins can resolve any.
  const { data: installment, error } = await supabase
    .from("installments")
    .select("id, installment_name, amount, status, students(name, student_code, course, batch)")
    .eq("id", installmentId)
    .single();

  if (error || !installment) {
    return new Response("Not found", { status: 404 });
  }
  if (installment.status !== "paid") {
    return new Response("Receipt not available until this installment is paid", { status: 409 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("id, transaction_id, verified_at, created_at")
    .eq("installment_id", installmentId)
    .eq("verification_status", "approved")
    .order("verified_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const pdfBuffer = await renderReceiptPdf({
    studentName: installment.students!.name,
    studentCode: installment.students!.student_code,
    course: installment.students!.course,
    batch: installment.students!.batch,
    installmentName: installment.installment_name,
    amount: installment.amount,
    paidAt: payment?.verified_at ?? payment?.created_at ?? new Date().toISOString(),
    transactionId: payment?.transaction_id ?? null,
    receiptNo: `RCPT-${(payment?.id ?? installment.id).slice(0, 8).toUpperCase()}`,
  });

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="clyra-receipt-${installment.students!.student_code}-${installment.installment_name.replace(/\s+/g, "-")}.pdf"`,
    },
  });
}
