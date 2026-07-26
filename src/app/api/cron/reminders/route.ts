import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { DueDateReminderEmail } from "@/lib/email/templates/due-date-reminder";

export const runtime = "nodejs";

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / msPerDay);
}

// Reminder cadence is derived purely from (due_date - today), so each installment gets
// exactly one email per milestone even though this route runs daily with no "already sent"
// tracking column -- the day offset itself is the de-duplication key.
function reminderTiming(dueDate: string, today: Date): "before" | "on" | "after" | null {
  const offset = daysBetween(today, new Date(dueDate)); // due date minus today
  if (offset === 3) return "before";
  if (offset === 0) return "on";
  if (offset === -3) return "after";
  return null;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date();

  const { data: installments, error } = await supabase
    .from("installments")
    .select("id, installment_name, amount, due_date, status, students(name, email)")
    .in("status", ["pending", "pending_verification", "rejected"]);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  for (const installment of installments ?? []) {
    const timing = reminderTiming(installment.due_date, today);
    if (!timing || !installment.students?.email) continue;

    const result = await sendEmail({
      to: installment.students.email,
      subject:
        timing === "after"
          ? `Overdue: ${installment.installment_name} - Clyra Fee Portal`
          : `Reminder: ${installment.installment_name} due ${timing === "on" ? "today" : "soon"} - Clyra Fee Portal`,
      react: DueDateReminderEmail({
        studentName: installment.students.name,
        installmentName: installment.installment_name,
        amount: installment.amount,
        dueDate: installment.due_date,
        timing,
      }),
    });

    if (result.skipped) {
      skipped++;
    } else {
      sent++;
    }
  }

  return Response.json({ scanned: installments?.length ?? 0, sent, skipped });
}
