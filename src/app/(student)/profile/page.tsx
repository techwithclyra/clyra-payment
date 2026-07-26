import { AlertTriangle, Calendar, GraduationCap, Mail, Phone, Users2 } from "lucide-react";

import { getCurrentProfile } from "@/lib/auth/roles";
import { getMyStudentRecord } from "@/lib/queries/student-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function StudentProfilePage() {
  const profile = await getCurrentProfile();
  const student = profile ? await getMyStudentRecord(profile.id) : null;

  if (!student) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No student record linked"
        description="Your account isn't linked to a student record yet. Please contact Clyra support."
      />
    );
  }

  const fields = [
    { icon: Mail, label: "Email", value: student.email },
    { icon: Phone, label: "Phone", value: student.phone ?? "Not provided" },
    { icon: GraduationCap, label: "Course", value: student.course },
    { icon: Users2, label: "Batch", value: student.batch },
    { icon: Calendar, label: "Joining date", value: formatDate(student.joiningDate) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">{student.studentCode}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{student.name}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <f.icon className="size-4 text-muted-foreground" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{f.label}</span>
                <span className="text-sm font-medium">{f.value}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fee summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Course fee</span>
            <span className="font-semibold">{formatCurrency(student.finalFee)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
