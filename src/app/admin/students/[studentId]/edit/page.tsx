import { getStudentDetail } from "@/lib/queries/student-detail";
import { StudentForm } from "@/components/students/student-form";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function EditStudentPage({ params }: PageProps) {
  const { studentId } = await params;
  const student = await getStudentDetail(studentId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Student</h1>
        <p className="text-sm text-muted-foreground">{student.studentCode}</p>
      </div>
      <StudentForm
        mode="edit"
        initialValues={{
          studentId: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone ?? "",
          course: student.course,
          batch: student.batch,
          joiningDate: student.joiningDate,
          originalFee: String(student.originalFee),
        }}
      />
    </div>
  );
}
