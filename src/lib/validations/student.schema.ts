import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  course: z.string().trim().min(1, "Course is required"),
  batch: z.string().trim().min(1, "Batch is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  originalFee: z.coerce.number().positive("Fee must be greater than 0"),
  initialPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = z.object({
  studentId: z.string().uuid(),
  name: z.string().trim().min(2, "Name is required"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  course: z.string().trim().min(1, "Course is required"),
  batch: z.string().trim().min(1, "Batch is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  originalFee: z.coerce.number().positive("Fee must be greater than 0"),
});

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
