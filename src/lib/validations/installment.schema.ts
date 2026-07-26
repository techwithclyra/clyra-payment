import { z } from "zod";

export const installmentPlanRowSchema = z.object({
  installmentName: z.string().trim().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
});

export const createInstallmentPlanSchema = z.object({
  studentId: z.string().uuid(),
  installments: z.array(installmentPlanRowSchema).min(1, "Add at least one installment"),
});

export type CreateInstallmentPlanInput = z.infer<typeof createInstallmentPlanSchema>;

export const addInstallmentSchema = z.object({
  studentId: z.string().uuid(),
  installmentName: z.string().trim().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
});

export const updateInstallmentSchema = z.object({
  installmentId: z.string().uuid(),
  installmentName: z.string().trim().min(1, "Name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
});

export const markInstallmentStatusSchema = z.object({
  installmentId: z.string().uuid(),
  status: z.enum(["paid", "pending", "overdue", "locked"]),
});
