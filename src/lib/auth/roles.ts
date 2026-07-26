import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/db/types";

export interface CurrentProfile {
  id: string;
  email: string | null;
  role: UserRole;
  fullName: string | null;
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role,
    fullName: profile.full_name,
  };
}

// Defense-in-depth re-check for Server Actions and layouts -- middleware.ts already redirects
// at the edge, but a Server Action can be invoked directly, so it must guard itself too.
export async function requireRole(role: UserRole): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.role !== role) {
    redirect(role === "admin" ? "/dashboard" : "/admin/dashboard");
  }

  return profile;
}
