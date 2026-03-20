import AppInitializer from "@/components/app-initializer";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppInitializer>
      <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <SiteHeader/>
          {children}
        </main>
      </div>
    </SidebarProvider>
    </AppInitializer>
    
  );
}