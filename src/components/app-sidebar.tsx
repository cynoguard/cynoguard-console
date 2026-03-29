"use client"

import {
  BookOpen,
  Bot,
  ChartArea,
  Command,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Projector,
  Search,
  Send,
  Settings2,
  Users
} from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useEffect, useState } from "react"

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
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()

 // ── Read localStorage at init — no useEffect needed ────
const [project]      = useState<string | null>(() =>
  typeof window !== "undefined" ? localStorage.getItem("activeProject") : null
)
const [organization] = useState<string | null>(() =>
  typeof window !== "undefined" ? localStorage.getItem("organization") : null
)

// ── Guard redirect ──────────────────────────────────────
useEffect(() => {
  if (!organization) {
    router.push("/organizations")
  } else if (!project) {
    router.push(`/${organization}/projects`)
  }
}, []) // eslint-disable-line react-hooks/exhaustive-deps

  const basePath = `/${organization}/${project}`

  const navItems = [
    {
      title: "Bot Detection",
      url: "#",
      icon: Bot,
      isActive: true,
      items: [
        { title: "Analytics Overview",  url: `${basePath}/bots/overview` },
        { title: "Real-time Logs",      url: `${basePath}/bots/logs` },
        { title: "Protection Rules",    url: `${basePath}/bots/rules` },
        { title: "API Keys",            url: `${basePath}/bots/api-keys` },
        { title: "Setup & Integration", url: `${basePath}/bots/setup` },
      ],
    },
    {
      title: "Domain Monitoring",
      url: "#",
      icon: Globe,
      items: [
        { title: "Watchlist",             url: `${basePath}/domain-monitoring` },
        { title: "Typosquatting Alerts",  url: `${basePath}/domains/alerts` },
      ],
    },
    {
      title: "Social Signals",
      url: "#",
      icon: Search,
      items: [
        { title: "Overview",  url: `${basePath}/social/overview` },
        { title: "Brand Mentions",  url: `${basePath}/social/feed` },
        { title: "Keywords Config", url: `${basePath}/social/keywords` },
      ],
    },
  ]

 const generalItems = [
  { name: "Overview",     url: `/${organization}/overview`,         icon: LayoutDashboard },
  { name: "Project Overview", url: `${basePath}/overview`,              icon: ChartArea },
  { name: "Projects",         url: `/${organization}/projects`,         icon: Projector },
]

  const systemItems = [
    { name: "Settings",         url: `/${organization}/settings`, icon: Settings2 },
    { name: "User Management",  url: `${basePath}/users`,    icon: Users },
  ]

  const secondaryItems = [
    { title: "Documentation", url: "https://docs.cynoguard.com", icon: BookOpen },
    { title: "Support",       url: "https://cynoguard.com/support", icon: LifeBuoy },
    { title: "Feedback",      url: "#", icon: Send },
  ]

  return (
    <Sidebar
      className="h-screen border-r"
      {...props}
    >
      {/* ── Header — Org identity ── */}
      <SidebarHeader className="border-b px-3 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={`/${organization}/projects`}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold capitalize">{organization}</span>
                  <span className="truncate text-xs text-muted-foreground capitalize">{project}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent className="flex-1 overflow-y-auto py-2 scrollbar-none">
        <NavGeneralItem groupLabel="General"  items={generalItems} />
        <NavItem        groupLabel="Products" items={navItems} />
        <NavGeneralItem groupLabel="System"   items={systemItems} />
      </SidebarContent>

      {/* ── Footer — user + logout ── */}
      <SidebarFooter className="border-t">
        <NavSecondary items={secondaryItems} />
        <SidebarSeparator />
        <SidebarMenu>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}