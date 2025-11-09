import type { ClerkUser } from "~/types/clerk";
import { LayoutDashboard, MessageCircle, Users, BarChart3, CreditCard, Settings } from "lucide-react";
import { Link } from "react-router";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { OrganizationSwitcher } from "./organization-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Chat",
      url: "/dashboard/chat",
      icon: MessageCircle,
    },
    {
      title: "Team",
      url: "/dashboard/team",
      icon: Users,
    },
    {
      title: "Usage",
      url: "/dashboard/usage",
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Billing",
      url: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
};

export function AppSidebar({
  variant,
  user,
}: {
  variant: "sidebar" | "floating" | "inset";
  user: ClerkUser;
}) {
  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to="/" prefetch="viewport">
              <span className="text-base font-semibold">Ras Mic Inc.</span>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-2">
          <OrganizationSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
