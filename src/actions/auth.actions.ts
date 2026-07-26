"use server";

import { createClient } from "@/lib/supabase/server";
import {
  otpRequestSchema,
  otpVerifySchema,
  passwordLoginSchema,
} from "@/lib/validations/auth.schema";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

async function resolveRedirect(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";
}

export async function signInWithPassword(
  input: unknown
): Promise<AuthActionResult> {
  const parsed = passwordLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { success: false, error: error?.message ?? "Invalid email or password" };
  }

  return { success: true, redirectTo: await resolveRedirect(data.user.id) };
}

export async function requestOtp(input: unknown): Promise<AuthActionResult> {
  const parsed = otpRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function verifyOtp(input: unknown): Promise<AuthActionResult> {
  const parsed = otpVerifySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.token,
    type: "email",
  });

  if (error || !data.user) {
    return { success: false, error: error?.message ?? "Invalid or expired code" };
  }

  return { success: true, redirectTo: await resolveRedirect(data.user.id) };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
