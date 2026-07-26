import { Users, Wallet, Hourglass, AlertTriangle, CalendarCheck } from "lucide-react";

import { getAdminDashboardStats, getRecentActivity } from "@/lib/queries/admin-dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([getAdminDashboardStats(), getRecentActivity()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of fee collection across all students.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Students" value={String(stats.totalStudents)} icon={Users} />
        <StatCard label="Total Collection" value={formatCurrency(stats.totalCollection)} icon={Wallet} tone="success" />
        <StatCard label="Pending Collection" value={formatCurrency(stats.pendingCollection)} icon={Hourglass} tone="warning" />
        <StatCard label="Overdue Payments" value={String(stats.overduePaymentsCount)} icon={AlertTriangle} tone="destructive" />
        <StatCard
          label="Today's Payments"
          value={formatCurrency(stats.todaysPaymentsAmount)}
          hint={`${stats.todaysPaymentsCount} payment${stats.todaysPaymentsCount === 1 ? "" : "s"}`}
          icon={CalendarCheck}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityFeed items={activity} />
        </CardContent>
      </Card>
    </div>
  );
}
