import { requireRole } from "@/lib/auth/roles";
import { AppShell, type NavItem } from "@/components/layout/app-shell";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/installments", label: "Installments", icon: "Receipt" },
  { href: "/payments", label: "Payments", icon: "Wallet" },
  { href: "/profile", label: "Profile", icon: "User" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("student");

  return (
    <AppShell
      navItems={navItems}
      brandLabel="Clyra"
      userName={profile.fullName ?? profile.email ?? "Student"}
      userRoleLabel="Student"
    >
      {children}
    </AppShell>
  );
}
