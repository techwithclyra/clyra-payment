import { StudentForm } from "@/components/students/student-form";

export default function NewStudentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Student</h1>
        <p className="text-sm text-muted-foreground">
          Create a new student record and login account.
        </p>
      </div>
      <StudentForm mode="create" />
    </div>
  );
}
