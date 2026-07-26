import { z } from "zod";

export const passwordLoginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type PasswordLoginInput = z.infer<typeof passwordLoginSchema>;

export const otpRequestSchema = z.object({
  email: z.email("Enter a valid email address"),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;

export const otpVerifySchema = z.object({
  email: z.email("Enter a valid email address"),
  token: z.string().length(6, "Enter the 6-digit code"),
});

export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
