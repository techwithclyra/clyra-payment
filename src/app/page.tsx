import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/roles";

export default async function RootPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  redirect(profile.role === "admin" ? "/admin/dashboard" : "/dashboard");
}
