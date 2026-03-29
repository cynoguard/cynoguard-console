"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockAlerts } from "@/lib/mock-data"
import type { SocialAlert } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import { Link2, UserX, Hash } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"

interface ThreatFeedProps {
  alerts?: SocialAlert[]
}

/* -------------------- Styles -------------------- */

const riskStyles: Record<string, string> = {
  Low: "bg-green-500/10 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  Critical: "bg-red-500/10 text-red-400 border-red-500/30",
}

const sentimentStyles: Record<string, string> = {
  positive: "bg-green-500/10 text-green-400 border-green-500/30",
  neutral: "bg-muted/50 text-muted-foreground border-border",
  negative: "bg-red-500/10 text-red-400 border-red-500/30",
}

const typeIcons: Record<string, any> = {
  phishing_link: Link2,
  impersonation: UserX,
  keyword_mention: Hash,
}

const platformIcons: Record<string, any> = {
  X: FaXTwitter,
}

/* -------------------- Helpers -------------------- */

// Format alert type nicely
function formatType(type: string) {
  return type.replace("_", " ").toUpperCase()
}

// Format date nicely
function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

export function ThreatFeed({ alerts }: ThreatFeedProps) {
  const [alertList, setAlertList] = useState<SocialAlert[]>(alerts || mockAlerts)
  const [selectedAlert, setSelectedAlert] = useState<SocialAlert | null>(null)

  // Handles resolving alert
  function handleResolve(id: string) {
    setAlertList((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: "resolved" } : alert
      )
    )
  }

  const activeAlerts = alertList.filter((a) => a.status === "active")

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Threat Feed</h2>
        <p className="text-sm text-muted-foreground">
          {activeAlerts.length} active alerts
        </p>
      </div>

      {/* Empty State */}
      {alertList.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          No threats detected.
        </Card>
      )}

      {/* Alerts */}
      <div className="space-y-4">
        {alertList.map((alert) => {
          const Icon = typeIcons[alert.type]
          const PlatformIcon = platformIcons[alert.platform]
          const isResolved = alert.status === "resolved"

          return (
            <Card
              key={alert.id}
              className={`relative p-5 rounded-xl transition ${
                isResolved ? "opacity-50" : "hover:border-primary/50"
              }`}
            >
              {/* Risk Indicator */}
              <div
                className={`absolute left-0 top-0 h-full w-1 ${
                  alert.riskLevel === "Critical"
                    ? "bg-red-500"
                    : alert.riskLevel === "High"
                    ? "bg-orange-500"
                    : alert.riskLevel === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />

              <div className="flex justify-between gap-6">
                {/* Left */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">

                    <div className="h-8 w-8 flex items-center justify-center rounded bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>

                    <h3 className="font-semibold">
                      {formatType(alert.type)}
                    </h3>

                    <Badge className={riskStyles[alert.riskLevel]}>
                      {alert.riskLevel.toUpperCase()}
                    </Badge>

                    <Badge className={sentimentStyles[alert.sentiment]}>
                      {alert.sentiment}
                    </Badge>

                    {isResolved && (
                      <Badge variant="outline">Resolved</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {alert.content}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {PlatformIcon && <PlatformIcon className="h-3 w-3" />}
                      {alert.platform}
                    </div>

                    <span>•</span>
                    <span>{alert.keyword}</span>

                    <span>•</span>
                    <span>{formatDate(alert.createdAt)}</span>
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    Details
                  </Button>

                  {!isResolved && (
                    <Button
                      size="sm"
                      title="Mark this alert as resolved"
                      onClick={() => handleResolve(alert.id)}
                    >
                      Resolve Alert
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAlert && formatType(selectedAlert.type)}
            </DialogTitle>
            <DialogDescription>Alert Details</DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-3 text-sm">
              <p>{selectedAlert.content}</p>
              <p><strong>Author:</strong> {selectedAlert.author}</p>
              <p><strong>Date:</strong> {formatDate(selectedAlert.createdAt)}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}