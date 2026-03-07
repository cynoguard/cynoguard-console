import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>

      <AppSidebar />

      <SidebarInset>

        {/* Header */}
        <SiteHeader />

        {/* Page Content */}
        <div className="flex flex-1 flex-col p-6 bg-background">
          {children}
        </div>

      </SidebarInset>

    </SidebarProvider>
  )
}