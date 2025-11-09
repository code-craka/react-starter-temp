import { getAuth } from "@clerk/react-router/ssr.server";
import { fetchQuery } from "convex/nextjs";
import {
  Activity,
  BarChart3,
  Flag,
  Heart,
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
} from "lucide-react";
import { Link, Outlet, useLocation, redirect } from "react-router";
import { api } from "../../../convex/_generated/api";
import type { Route } from "./+types/layout";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { SignOutButton } from "@clerk/react-router";

export async function loader(args: Route.LoaderArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    throw redirect("/sign-in");
  }

  // Check if user is super admin
  try {
    // Get user from database
    const user = await fetchQuery(api.users.getCurrentUser);

    if (!user || user.role !== "super_admin") {
      throw redirect("/dashboard");
    }

    return { user };
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    throw redirect("/dashboard");
  }
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
  const location = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      current: location.pathname === "/admin",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      current: location.pathname === "/admin/users",
    },
    {
      name: "Organizations",
      href: "/admin/organizations",
      icon: Building2,
      current: location.pathname === "/admin/organizations",
    },
    {
      name: "System Health",
      href: "/admin/health",
      icon: Heart,
      current: location.pathname === "/admin/health",
    },
    {
      name: "Monitoring",
      href: "/admin/monitoring",
      icon: Activity,
      current: location.pathname === "/admin/monitoring",
    },
    {
      name: "Feature Flags",
      href: "/admin/features",
      icon: Flag,
      current: location.pathname === "/admin/features",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
      current: location.pathname === "/admin/analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-muted/30 border-r">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <img src="/rsk.png" alt="Taskcoda" className="h-8 w-8" />
            <div>
              <div className="font-semibold">Taskcoda Admin</div>
              <div className="text-xs text-muted-foreground">Super Admin Panel</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  item.current
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t p-4">
            <div className="mb-3 space-y-1">
              <div className="text-sm font-medium">{loaderData.user.name}</div>
              <div className="text-xs text-muted-foreground">{loaderData.user.email}</div>
            </div>
            <SignOutButton>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {navigation.find((item) => item.current)?.name || "Admin Panel"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
