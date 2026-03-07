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
      <div className="flex flex-col w-full min-h-svh">

        {/* Header spans full width across top */}
        <SiteHeader />

        {/* Sidebar + Content side by side below header */}
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col p-6 bg-background">
              {children}
            </div>
          </SidebarInset>
        </div>

      </div>
    </SidebarProvider>
  )
}