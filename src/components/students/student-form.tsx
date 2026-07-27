"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createStudent, updateStudent } from "@/actions/students.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface StudentFormValues {
  studentId?: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  joiningDate: string;
  originalFee: string;
}

const emptyValues: StudentFormValues = {
  name: "",
  email: "",
  phone: "",
  course: "DSA",
  batch: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  originalFee: "",
};

export function StudentForm({
  mode,
  initialValues,
}: {
  mode: "create" | "edit";
  initialValues?: StudentFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<StudentFormValues>(initialValues ?? emptyValues);
  const [initialPassword, setInitialPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof StudentFormValues>(key: K, value: StudentFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createStudent({
              name: values.name,
              email: values.email,
              phone: values.phone,
              course: values.course,
              batch: values.batch,
              joiningDate: values.joiningDate,
              originalFee: values.originalFee,
              initialPassword,
            })
          : await updateStudent({
              studentId: values.studentId,
              name: values.name,
              phone: values.phone,
              course: values.course,
              batch: values.batch,
              joiningDate: values.joiningDate,
              originalFee: values.originalFee,
            });

      if (!result.success) {
        toast.error(result.error ?? "Something went wrong");
        return;
      }

      toast.success(mode === "create" ? "Student created" : "Student updated");
      router.push(
        mode === "create" ? `/admin/students/${result.studentId}` : `/admin/students/${values.studentId}`
      );
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={values.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              disabled={mode === "edit"}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={values.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="joiningDate">Joining date</Label>
            <Input
              id="joiningDate"
              type="date"
              required
              value={values.joiningDate}
              onChange={(e) => update("joiningDate", e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="course">Course</Label>
            <Input id="course" required value={values.course} onChange={(e) => update("course", e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="batch">Batch</Label>
            <Input id="batch" required value={values.batch} onChange={(e) => update("batch", e.target.value)} />
          </div>

          <Separator className="sm:col-span-2" />

          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="originalFee">Course fee (INR)</Label>
            <Input
              id="originalFee"
              type="number"
              min={0}
              step="0.01"
              required
              value={values.originalFee}
              onChange={(e) => update("originalFee", e.target.value)}
            />
          </div>

          {mode === "create" && (
            <>
              <Separator className="sm:col-span-2" />
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="initialPassword">Initial password (optional)</Label>
                <PasswordInput
                  id="initialPassword"
                  placeholder="Leave blank for OTP-only sign in"
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  If left blank, the student can only sign in with an emailed one-time code
                  until they set a password later.
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {mode === "create" ? "Create student" : "Save changes"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
