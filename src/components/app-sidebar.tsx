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
import { useRouter } from "next/navigation"
import { useEffect } from "react"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const project = localStorage.getItem("activeProject");
  const organization = localStorage.getItem("activeOrgName");
  const router = useRouter();

  useEffect(()=>{
    if(!organization){
      router.push("/organizations");
    }else if(!project){
      router.push(`/${organization}/projects`);
    }
  },[organization, project, router]);

  
  const basePath = `/${organization}/${project}`;
  const data = {
  user: {
    name: "CynoGuard Admin",
    email: "admin@cynoguard.io",
    avatar: "/avatars/admin.jpg",
  },

  general: [
    {
      name: "Global Overview",
      url: `${basePath}/overview`,
      icon: LayoutDashboard,
    },
    {
      name: "System Activity",
      url: `${basePath}/activity`,
      icon: Activity,
    },
  ],

  navItem: [
    {
      title: "Bot Detection",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        {
          title: "Analytics Overview",
          url: `${basePath}/bots/overview`,
        },
        {
          title: "Real-time Logs",
          url: `${basePath}/bots/logs`,
        },
        {
          title: "Protection Rules",
          url: `${basePath}/bots/rules`,
        },
         {
          title: "API Keys",
          url: `${basePath}/bots/api-keys`,
        },
        {
          title: "Setup & Integration",
          url: `${basePath}/bots/setup`,
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
          url: `${basePath}/domain-monitoring`,
        },
        {
          title: "Typosquatting Alerts",
          url: `${basePath}/domains/alerts`,
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
          url: `${basePath}/social/feed`,
        },
        {
          title: "Keywords Config",
          url: `${basePath}/social/keywords`,
        },
      ],
    },
  ],

  navSecondary: [
    {
      title: "Documentation",
      url: "https://docs.cynoguard.com",
      icon: BookOpen,
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
      url: `${basePath}/settings`,
      icon: Settings2,
    },
    {
      name: "User Management",
      url: `${basePath}/users`,
      icon: Users,
    },
  ],
};
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
