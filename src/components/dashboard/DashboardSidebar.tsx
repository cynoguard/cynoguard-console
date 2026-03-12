"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  Hash,
  Settings,
  Shield,
} from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Mentions", href: "/dashboard/mentions", icon: MessageSquare, exact: false },
  { label: "Keywords", href: "/dashboard/keywords", icon: Hash, exact: false },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-r border-sidebar-border bg-sidebar min-h-screen">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/10">
        <Image
          src="/images/cynoguard-logo.png"
          alt="CynoGuard logo"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span className="text-base font-bold tracking-tight text-white">CynoGuard</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-3 pb-4">
        <div className="rounded-lg border border-sidebar-border bg-sidebar-accent">
          <div className="flex items-center gap-2 text-white">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-medium">Protection Active</span>
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            All monitors are running. Last scan 2m ago.
          </p>
        </div>
      </div>
    </aside>
  )
}
