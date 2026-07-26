"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStudentSchema, updateStudentSchema } from "@/lib/validations/student.schema";

export interface StudentActionResult {
  success: boolean;
  error?: string;
  studentId?: string;
}

export async function createStudent(input: unknown): Promise<StudentActionResult> {
  await requireRole("admin");

  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const adminClient = createAdminClient();
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.initialPassword ? data.initialPassword : undefined,
    email_confirm: true,
    user_metadata: { role: "student", full_name: data.name },
  });

  if (authError || !authUser.user) {
    return {
      success: false,
      error: authError?.message ?? "Could not create the student's login account",
    };
  }

  const supabase = await createClient();
  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      user_id: authUser.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      course: data.course,
      batch: data.batch,
      joining_date: data.joiningDate,
      original_fee: data.originalFee,
      scholarship: 0,
    })
    .select("id")
    .single();

  if (studentError || !student) {
    // Compensate: don't leave an orphaned auth account with no student record behind.
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    return {
      success: false,
      error: studentError?.message ?? "Could not create the student record",
    };
  }

  revalidatePath("/admin/students");
  return { success: true, studentId: student.id };
}

export async function updateStudent(input: unknown): Promise<StudentActionResult> {
  await requireRole("admin");

  const parsed = updateStudentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      name: data.name,
      phone: data.phone || null,
      course: data.course,
      batch: data.batch,
      joining_date: data.joiningDate,
      original_fee: data.originalFee,
    })
    .eq("id", data.studentId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${data.studentId}`);
  return { success: true, studentId: data.studentId };
}

export async function deleteStudent(studentId: string): Promise<StudentActionResult> {
  await requireRole("admin");

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("id", studentId)
    .single();

  const { error } = await supabase.from("students").delete().eq("id", studentId);
  if (error) {
    return { success: false, error: error.message };
  }

  if (student?.user_id) {
    const adminClient = createAdminClient();
    await adminClient.auth.admin.deleteUser(student.user_id);
  }

  revalidatePath("/admin/students");
  return { success: true };
}
