import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminDashboardStats {
  totalStudents: number;
  totalCollection: number;
  pendingCollection: number;
  overduePaymentsCount: number;
  todaysPaymentsCount: number;
  todaysPaymentsAmount: number;
}

export interface RecentActivityItem {
  id: string;
  type: "payment_submitted" | "payment_approved" | "payment_rejected";
  studentName: string;
  installmentName: string;
  amount: number;
  at: string;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: totalStudents }, { data: installments }, { data: todaysPayments }] =
    await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("installments_with_effective_status").select("amount, status, effective_status"),
      supabase
        .from("payments")
        .select("amount")
        .eq("verification_status", "approved")
        .gte("verified_at", `${today}T00:00:00Z`)
        .lte("verified_at", `${today}T23:59:59Z`),
    ]);

  const rows = installments ?? [];
  const totalCollection = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const pendingCollection = rows
    .filter((r) => r.status !== "paid" && r.status !== "locked")
    .reduce((s, r) => s + r.amount, 0);
  const overduePaymentsCount = rows.filter((r) => r.effective_status === "overdue").length;

  const todaysRows = todaysPayments ?? [];

  return {
    totalStudents: totalStudents ?? 0,
    totalCollection,
    pendingCollection,
    overduePaymentsCount,
    todaysPaymentsCount: todaysRows.length,
    todaysPaymentsAmount: todaysRows.reduce((s, r) => s + r.amount, 0),
  };
}

export async function getRecentActivity(limit = 8): Promise<RecentActivityItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("id, amount, verification_status, created_at, verified_at, students(name), installments!installment_id(installment_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    id: row.id,
    type:
      row.verification_status === "approved"
        ? "payment_approved"
        : row.verification_status === "rejected"
          ? "payment_rejected"
          : "payment_submitted",
    studentName: row.students?.name ?? "Unknown student",
    installmentName: row.installments?.installment_name ?? "—",
    amount: row.amount,
    at: row.verified_at ?? row.created_at,
  }));
}
