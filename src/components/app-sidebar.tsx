"use client"

import {
  Activity,
  BookOpen,
  Bot,
  Command,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Search,
  Send,
  Settings2,
  Users
} from "lucide-react"
import * as React from "react"

import { NavItem } from "@/components/nav-main"
import { NavGeneralItem } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "CynoGuard Admin",
    email: "admin@cynoguard.io",
    avatar: "/avatars/admin.jpg",
  },
  // Main Navigation Group (Non-expandable single items)
  general: [
    {
      name: "Global Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "System Activity",
      url: "/dashboard/activity",
      icon: Activity,
    },
  ],
  // The core modules of the project (Expandable)
  navItem: [
    {
      title: "Bot Detection",
      url: "#",
      icon: Bot,
      isActive: true, // Keep it expanded as you are the leader of this part
      items: [
        {
          title: "Analytics Overview",
          url: "/dashboard/bots/overview",
        },
        {
          title: "Real-time Logs",
          url: "/dashboard/bots/logs",
        },
        {
         title: "Protection Rules", // This is where Whitelist/Custom rules live
         url: "/dashboard/bots/rules",
        },
        {
          title: "Setup & Integration",
          url: "/dashboard/bots/setup",
        },
        
      ],
    },
    {
      title: "Domain Monitoring",
      url: "#",
      icon: Globe,
      items: [
        {
          title: "Watchlist",
          url: "/dashboard/domains/list",
        },
        {
          title: "Typosquatting Alerts",
          url: "/dashboard/domains/alerts",
        },
      ],
    },
    {
      title: "Social Signals",
      url: "#",
      icon: Search,
      items: [
        {
          title: "Brand Mentions",
          url: "/dashboard/social/feed",
        },
        {
          title: "Keywords Config",
          url: "/dashboard/social/keywords",
        },
      ],
    },
  ],
  navSecondary: [
     {
      title:"Documentation",
      url:"https://docs.cynoguard.com",
      icon:BookOpen,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
   
  ],
  system: [
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      name: "User Management",
      url: "/dashboard/users",
      icon: Users,
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Cynoguard Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto scrollbar-none">
        <NavGeneralItem groupLabel="General" items={data.general} />
        <NavItem groupLabel="Products" items={data.navItem} /> 
        <NavGeneralItem groupLabel="System" items={data.system} />
      </SidebarContent>
      <SidebarFooter>
                <NavSecondary items={data.navSecondary} className="mt-auto" />

      </SidebarFooter>
    </Sidebar>
  )
}
