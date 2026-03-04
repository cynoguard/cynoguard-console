import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">

        {/* Header */}
        <SiteHeader />

        {/* Body */}
        <div className="flex flex-1">

          <DashboardSidebar />

          {/* FIXED BACKGROUND */}
          <div className="flex-1 overflow-y-auto bg-background">
            {children}
          </div>

        </div>
      </div>
    </SidebarProvider>
  )
}