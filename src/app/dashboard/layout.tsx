import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {/* Sidebar sits on the left, full height, no overlap */}
      <AppSidebar />

      {/* Everything to the right of the sidebar */}
      <SidebarInset>
        {/* Header is now INSIDE SidebarInset — sits below sidebar header naturally */}
        <SiteHeader />

        {/* Page content */}
        <div className="flex flex-1 flex-col p-6 bg-background">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}