"use server";

import { revalidatePath } from "next/cache";
import { requireRole, getCurrentProfile } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payment-provider";
import {
  ACCEPTED_SCREENSHOT_TYPES,
  MAX_SCREENSHOT_BYTES,
  submitPaymentProofSchema,
} from "@/lib/validations/payment.schema";
import { sendEmail } from "@/lib/email/resend";
import { PaymentApprovedEmail } from "@/lib/email/templates/payment-approved";
import { AdminPaymentSubmittedEmail } from "@/lib/email/templates/admin-payment-submitted";
import { renderReceiptPdf } from "@/lib/pdf/receipt";

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "techwithclyra@gmail.com";

export interface PaymentActionResult {
  success: boolean;
  error?: string;
  payUrl?: string;
}

export async function getPayLink(installmentId: string): Promise<PaymentActionResult> {
  const profile = await requireRole("student");
  const supabase = await createClient();

  const { data: installment, error } = await supabase
    .from("installments")
    .select("id, amount, status, students(id, name)")
    .eq("id", installmentId)
    .single();

  if (error || !installment) {
    return { success: false, error: "Installment not found" };
  }
  if (installment.status !== "pending" && installment.status !== "rejected") {
    return { success: false, error: "This installment is not currently payable" };
  }

  const provider = getPaymentProvider();
  const link = await provider.generatePayLink({
    amount: installment.amount,
    studentId: installment.students!.id,
    installmentId: installment.id,
    studentName: installment.students!.name,
    transactionNote: `Clyra fee - ${profile.fullName ?? installment.students!.name}`,
  });

  return { success: true, payUrl: link.url };
}

export async function submitPaymentProof(formData: FormData): Promise<PaymentActionResult> {
  await requireRole("student");

  const parsed = submitPaymentProofSchema.safeParse({
    installmentId: formData.get("installmentId"),
    transactionId: formData.get("transactionId"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const file = formData.get("screenshot");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, error: "Please attach a payment screenshot" };
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    return { success: false, error: "Screenshot must be under 5MB" };
  }
  if (!ACCEPTED_SCREENSHOT_TYPES.includes(file.type)) {
    return { success: false, error: "Screenshot must be a PNG, JPEG, or WEBP image" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not signed in" };
  }

  const { data: installment, error: installmentError } = await supabase
    .from("installments")
    .select("id, student_id, installment_name, amount, status, students(name, student_code)")
    .eq("id", parsed.data.installmentId)
    .single();

  if (installmentError || !installment) {
    return { success: false, error: "Installment not found" };
  }
  if (installment.status !== "pending" && installment.status !== "rejected") {
    return { success: false, error: "This installment is not currently payable" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const objectPath = `${user.id}/${installment.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-proofs")
    .upload(objectPath, file, { contentType: file.type });

  if (uploadError) {
    return { success: false, error: `Could not upload screenshot: ${uploadError.message}` };
  }

  const { error: insertError } = await supabase.from("payments").insert({
    student_id: installment.student_id,
    installment_id: installment.id,
    amount: installment.amount,
    screenshot_path: objectPath,
    transaction_id: parsed.data.transactionId,
    note: parsed.data.note || null,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Best-effort: admin needs to know a new payment is waiting in the verification queue.
  await sendEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New payment to verify - ${installment.students?.name ?? "a student"}`,
    react: AdminPaymentSubmittedEmail({
      studentName: installment.students?.name ?? "Unknown student",
      studentCode: installment.students?.student_code ?? "",
      installmentName: installment.installment_name,
      amount: installment.amount,
      transactionId: parsed.data.transactionId,
    }),
  });

  revalidatePath("/installments");
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function approvePayment(paymentId: string): Promise<PaymentActionResult> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .update({ verification_status: "approved" })
    .eq("id", paymentId)
    .select(
      "id, student_id, amount, transaction_id, verified_at, installments!installment_id(installment_name), students(name, email, student_code, course, batch)"
    )
    .single();

  if (error || !payment) {
    return { success: false, error: error?.message ?? "Payment not found" };
  }

  if (payment.students?.email) {
    const installmentName = payment.installments?.installment_name ?? "your installment";

    // Best-effort: the receipt is also always downloadable from the portal, so a failure
    // here should never block the approval itself -- fall back to sending without it.
    let receiptAttachment: { filename: string; content: Buffer } | undefined;
    try {
      const receiptPdf = await renderReceiptPdf({
        studentName: payment.students.name,
        studentCode: payment.students.student_code,
        course: payment.students.course,
        batch: payment.students.batch,
        installmentName,
        amount: payment.amount,
        paidAt: payment.verified_at ?? new Date().toISOString(),
        transactionId: payment.transaction_id,
        receiptNo: `RCPT-${payment.id.slice(0, 8).toUpperCase()}`,
      });
      receiptAttachment = {
        filename: `clyra-receipt-${payment.students.student_code}-${installmentName.replace(/\s+/g, "-")}.pdf`,
        content: receiptPdf,
      };
    } catch (err) {
      console.error("[receipt] failed to render for approval email:", err);
    }

    await sendEmail({
      to: payment.students.email,
      subject: "Payment approved - Clyra Fee Portal",
      react: PaymentApprovedEmail({
        studentName: payment.students.name,
        installmentName,
        amount: payment.amount,
      }),
      attachments: receiptAttachment ? [receiptAttachment] : undefined,
    });
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/students/${payment.student_id}`);
  return { success: true };
}

export async function rejectPayment(paymentId: string, remarks?: string): Promise<PaymentActionResult> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .update({ verification_status: "rejected", remarks: remarks || null })
    .eq("id", paymentId)
    .select("student_id")
    .single();

  if (error || !payment) {
    return { success: false, error: error?.message ?? "Payment not found" };
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/students/${payment.student_id}`);
  return { success: true };
}

export async function requestReupload(paymentId: string, remarks?: string): Promise<PaymentActionResult> {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: payment, error } = await supabase
    .from("payments")
    .update({ verification_status: "reupload_requested", remarks: remarks || null })
    .eq("id", paymentId)
    .select("student_id")
    .single();

  if (error || !payment) {
    return { success: false, error: error?.message ?? "Payment not found" };
  }

  revalidatePath("/admin/verifications");
  revalidatePath(`/admin/students/${payment.student_id}`);
  return { success: true };
}

export async function getScreenshotUrl(screenshotPath: string): Promise<string | null> {
  await getCurrentProfile();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("payment-proofs")
    .createSignedUrl(screenshotPath, 60 * 10);

  if (error || !data) return null;
  return data.signedUrl;
}
