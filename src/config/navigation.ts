import {
  Activity,
  BookOpen,
  Bot,
  Globe,
  LayoutDashboard,
  LifeBuoy,
  Search,
  Send,
  Settings2,
  Users,
} from "lucide-react"

export const navigation = {
  // General Section
  general: [
    {
      name: "Global Overview",
      url: "/dashboard/social",
      icon: LayoutDashboard,
    },
    {
      name: "System Activity",
      url: "/dashboard/activity",
      icon: Activity,
    },
  ],

  // Main Product Modules
  products: [
    {
      title: "Bot Detection",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Analytics Overview",
          url: "/dashboard/bots/overview",
        },
        {
          title: "Real-time Logs",
          url: "/dashboard/bots/logs",
        },
        {
          title: "Protection Rules",
          url: "/dashboard/bots/rules",
        },
        {
          title: "Setup & Integration",
          url: "/dashboard/bots/setup",
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
          url: "/dashboard/domain-monitoring",
        },
        {
          title: "Typosquatting Alerts",
          url: "/dashboard/domains/alerts",
        },
      ],
    },

    {
      title: "Social Signals",
      url: "#",
      icon: Search,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard/social",
        },
        {
          title: "Mentions",
          url: "/dashboard/social/feed",
        },
        {
          title: "Keywords",
          url: "/dashboard/social/keywords",
        },
      ],
    },
  ],

  // System Section
  system: [
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      name: "User Management",
      url: "/dashboard/users",
      icon: Users,
    },
  ],

  // Footer Links
  secondary: [
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
}