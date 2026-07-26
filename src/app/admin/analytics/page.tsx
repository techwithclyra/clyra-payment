import {
  getFeeStatusBreakdown,
  getMonthlyCollection,
  getOverdueStudents,
} from "@/lib/queries/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectionByMonthChart } from "@/components/dashboard/charts/collection-by-month-chart";
import { FeeStatusChart } from "@/components/dashboard/charts/fee-status-chart";
import { OverdueStudentsTable } from "@/components/students/overdue-students-table";
import { ExportMenu } from "@/components/dashboard/export-menu";

export default async function AnalyticsPage() {
  const [monthly, breakdown, overdue] = await Promise.all([
    getMonthlyCollection(6),
    getFeeStatusBreakdown(),
    getOverdueStudents(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Collection trends and outstanding fees.</p>
        </div>
        <ExportMenu />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collection per month</CardTitle>
          </CardHeader>
          <CardContent>
            <CollectionByMonthChart data={monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee status breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <FeeStatusChart data={breakdown} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overdue students</CardTitle>
        </CardHeader>
        <CardContent>
          <OverdueStudentsTable rows={overdue} />
        </CardContent>
      </Card>
    </div>
  );
}
