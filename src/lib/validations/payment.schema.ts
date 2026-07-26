import { z } from "zod";

export const submitPaymentProofSchema = z.object({
  installmentId: z.string().uuid(),
  transactionId: z.string().trim().min(3, "Enter the UPI transaction ID"),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SubmitPaymentProofInput = z.infer<typeof submitPaymentProofSchema>;

export const reviewPaymentSchema = z.object({
  paymentId: z.string().uuid(),
  remarks: z.string().trim().max(500).optional().or(z.literal("")),
});

export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_SCREENSHOT_TYPES = ["image/png", "image/jpeg", "image/webp"];
