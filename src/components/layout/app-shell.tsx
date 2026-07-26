"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, LayoutDashboard, Users, ShieldCheck, BarChart3, Receipt, Wallet, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PageTransition } from "@/components/layout/page-transition";
import { useRouter } from "next/navigation";

// Server Components (the admin/student layout.tsx files) can't pass component references
// (like a Lucide icon) as props to this Client Component -- React Server Components only
// serialize plain data across that boundary. Nav items carry a string icon name instead,
// resolved to the actual icon component from this fixed registry on the client side.
const ICONS = {
  LayoutDashboard,
  Users,
  ShieldCheck,
  BarChart3,
  Receipt,
  Wallet,
  User,
} as const;

export type NavIconName = keyof typeof ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
}

interface AppShellProps {
  navItems: NavItem[];
  brandLabel: string;
  userName: string;
  userRoleLabel: string;
  children: React.ReactNode;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function NavLinks({ navItems, pathname, onNavigate }: { navItems: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ navItems, brandLabel, userName, userRoleLabel, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar md:flex">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            C
          </span>
          <span className="text-base font-semibold tracking-tight">{brandLabel}</span>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks navItems={navItems} pathname={pathname} />
        </div>
        <div className="flex items-center gap-3 border-t p-4">
          <Avatar className="size-9">
            <AvatarFallback>{initials(userName) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{userName}</span>
            <span className="text-xs text-muted-foreground">{userRoleLabel}</span>
          </div>
          <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex h-16 items-center gap-3 border-b bg-background px-4 md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  C
                </span>
                <span className="text-base font-semibold tracking-tight">{brandLabel}</span>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <NavLinks navItems={navItems} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="border-t p-4">
                <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOut}>
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-x-hidden p-4 md:p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
