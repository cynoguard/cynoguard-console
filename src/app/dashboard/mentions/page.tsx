"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ThreatFeed } from "@/components/dashboard/ThreatFeed"
import type { SocialAlert } from "@/lib/types/social-alert"

const mockAlerts: SocialAlert[] = [
  {
    id: "1",
    type: "phishing_link",
    platform: "X",
    keyword: "CynoGuard",
    content: "URGENT: Account compromised.",
    sentiment: "negative",
    riskLevel: "Critical",
    createdAt: "2h ago",
    status: "active",
  },
  {
    id: "2",
    type: "impersonation",
    platform: "REDDIT",
    keyword: "CynoGuard",
    content: "Fake support account detected.",
    sentiment: "negative",
    riskLevel: "Critical",
    createdAt: "3h ago",
    status: "active",
  },
  {
    id: "3",
    type: "keyword_mention",
    platform: "X",
    keyword: "CynoGuard",
    content: "Great product update!",
    sentiment: "positive",
    riskLevel: "Low",
    createdAt: "5h ago",
    status: "active",
  },
  {
    id: "4",
    type: "phishing_link",
    platform: "X",
    keyword: "CynoGuard",
    content: "Suspicious login link detected.",
    sentiment: "negative",
    riskLevel: "High",
    createdAt: "8h ago",
    status: "active",
  },
  {
    id: "5",
    type: "keyword_mention",
    platform: "REDDIT",
    keyword: "CynoGuard",
    content: "Pricing discussion thread.",
    sentiment: "neutral",
    riskLevel: "Low",
    createdAt: "1d ago",
    status: "active",
  },
  {
    id: "6",
    type: "impersonation",
    platform: "X",
    keyword: "CynoGuard",
    content: "Fake beta invitation message.",
    sentiment: "negative",
    riskLevel: "High",
    createdAt: "2d ago",
    status: "active",
  },
  {
    id: "7",
    type: "keyword_mention",
    platform: "REDDIT",
    keyword: "CynoGuard",
    content: "Positive review mention.",
    sentiment: "positive",
    riskLevel: "Low",
    createdAt: "3d ago",
    status: "active",
  },
]

export default function MentionsPage() {
  return (
    <>
      <DashboardHeader />

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Mentions & Alerts
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review all social media mentions, phishing attempts, and impersonation alerts.
            </p>
          </div>

          {/* Threat Feed */}
          <ThreatFeed alerts={mockAlerts} />
        </div>
      </main>
    </>
  )
}