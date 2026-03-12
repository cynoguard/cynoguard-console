"use client"

import { SidebarIcon } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSidebar } from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();

  const data = {
  user: {
    name: "CynoGuard Admin",
    email: "admin@cynoguard.io",
    avatar: "/avatars/admin.jpg",
  },
};

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b pb-4">
      <div className="flex justify-between h-(--header-height) w-full items-center gap-2 px-4">
        <div className="flex items-center">
          <Button
          className="h-8 w-8"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation="vertical" className="mr-4 h-4" />
        {/* <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                Building Your Application
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Fetching</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      <Separator orientation="vertical" className="mr-2 h-4" /> */}
        {/* <HeaderMetrics /> */}
        </div>
       
        <div className="flex flex-row items-center justify-center gap-4">
          <SearchForm className="w-full sm:ml-auto sm:w-auto" />
          <div className="max-w-2xl">
          <NavUser user={data.user} />
          </div>
        </div>
        
      </div>
    </header>
  )
}
