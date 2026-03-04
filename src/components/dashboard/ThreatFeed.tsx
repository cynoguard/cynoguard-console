"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SocialAlert } from "@/lib/types/social-alert"
import { AlertDetailModal } from "./AlertDetailModal"

import { Link2, UserX, Hash } from "lucide-react"
import { SiReddit } from "react-icons/si"
import { FaXTwitter } from "react-icons/fa6"

interface ThreatFeedProps {
  alerts?: SocialAlert[]
}

/* ============================= */
/* STYLE MAPS */
/* ============================= */

const riskStyles: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  High: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Critical: "bg-red-500/10 text-red-600 border-red-500/20",
}

const sentimentStyles: Record<string, string> = {
  positive: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  neutral: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  negative: "bg-red-500/10 text-red-600 border-red-500/20",
}

const typeIcons: Record<string, any> = {
  phishing_link: Link2,
  impersonation: UserX,
  keyword_mention: Hash,
}

const platformIcons: Record<string, any> = {
  X: FaXTwitter,
  REDDIT: SiReddit,
}

/* ============================= */
/* COMPONENT */
/* ============================= */

export function ThreatFeed({ alerts = [] }: ThreatFeedProps) {
  const [alertList, setAlertList] = useState(alerts)
  const [selectedAlert, setSelectedAlert] = useState<SocialAlert | null>(null)

  const handleResolve = (id: string) => {
    setAlertList((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, status: "resolved" }
          : alert
      )
    )
  }

  const activeAlerts = alertList.filter(
    (a) => a.status === "active"
  )

  const criticalCount = activeAlerts.filter(
    (a) => a.riskLevel === "Critical"
  ).length

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Threat Feed
        </h2>
        <p className="text-sm text-slate-500">
          {activeAlerts.length} active alerts{" "}
          {criticalCount > 0 && (
            <span className="text-red-600 font-medium">
              {criticalCount} critical
            </span>
          )}
        </p>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {alertList.map((alert) => {
          const Icon = typeIcons[alert.type]
          const PlatformIcon = platformIcons[alert.platform]
          const isResolved = alert.status === "resolved"

          return (
            <Card
              key={alert.id}
              className={`relative rounded-xl p-6 transition-all duration-300 ${
                isResolved
                  ? "opacity-50 grayscale"
                  : "hover:shadow-md"
              }`}
            >
              {/* Left Risk Indicator */}
              <div
                className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
                  alert.riskLevel === "Critical"
                    ? "bg-red-500"
                    : alert.riskLevel === "High"
                    ? "bg-orange-500"
                    : alert.riskLevel === "Medium"
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />

              <div className="flex items-start justify-between gap-6">
                {/* LEFT SIDE */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Type Icon */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                      <Icon className="h-4 w-4 text-slate-600" />
                    </div>

                    <h3 className="font-semibold text-slate-900 capitalize">
                      {alert.type.replace("_", " ")}
                    </h3>

                    {/* Risk Badge */}
                    <Badge
                      variant="outline"
                      className={riskStyles[alert.riskLevel]}
                    >
                      {alert.riskLevel}
                    </Badge>

                    {/* Sentiment Badge */}
                    <Badge
                      variant="outline"
                      className={sentimentStyles[alert.sentiment]}
                    >
                      {alert.sentiment}
                    </Badge>

                    {isResolved && (
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-500 border-slate-200"
                      >
                        Resolved
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-slate-600">
                    {alert.content}
                  </p>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    {/* Platform */}
                    <div className="flex items-center gap-1.5">
                      {PlatformIcon && (
                        <PlatformIcon className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      <span className="uppercase tracking-wide">
                        {alert.platform}
                      </span>
                    </div>

                    <span>•</span>

                    {/* Keyword */}
                    <span className="font-medium text-slate-600">
                      {alert.keyword}
                    </span>

                    <span>•</span>

                    {/* Time */}
                    <span>{alert.createdAt}</span>
                  </div>
                </div>

                {/* RIGHT SIDE ACTIONS */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlert(alert)}
                    disabled={isResolved}
                  >
                    Details
                  </Button>

                  {!isResolved && (
                    <Button
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Professional Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        open={!!selectedAlert}
        onOpenChange={(open) => {
          if (!open) setSelectedAlert(null)
        }}
      />
    </>
  )
}