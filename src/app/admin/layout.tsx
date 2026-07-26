import { requireRole } from "@/lib/auth/roles";
import { AppShell, type NavItem } from "@/components/layout/app-shell";

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/students", label: "Students", icon: "Users" },
  { href: "/admin/verifications", label: "Verifications", icon: "ShieldCheck" },
  { href: "/admin/analytics", label: "Analytics", icon: "BarChart3" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("admin");

  return (
    <AppShell
      navItems={navItems}
      brandLabel="Clyra Admin"
      userName={profile.fullName ?? profile.email ?? "Admin"}
      userRoleLabel="Administrator"
    >
      {children}
    </AppShell>
  );
}
