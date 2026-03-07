"use client"

import * as React from "react"
import { Command } from "lucide-react"

import { navigation } from "@/config/navigation"

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
} from "@/components/ui/sidebar"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">CynoGuard Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Navigation */}
      <SidebarContent className="overflow-y-auto scrollbar-none">

        {/* General */}
        <NavGeneralItem
          groupLabel="General"
          items={navigation.general}
        />

        {/* Products */}
        <NavItem
          groupLabel="Products"
          items={navigation.products}
        />

        {/* System */}
        <NavGeneralItem
          groupLabel="System"
          items={navigation.system}
        />

      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <NavSecondary
          items={navigation.secondary}
          className="mt-auto"
        />
      </SidebarFooter>
    </Sidebar>
  )
}