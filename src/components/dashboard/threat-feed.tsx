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

import { Link2, UserX, Hash, Clock, User } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"

interface ThreatFeedProps {
  alerts?: SocialAlert[]
}

/* Risk Level Colors */

const riskStyles: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-400 border-red-500/40",
  High: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  Low: "bg-green-500/20 text-green-400 border-green-500/40",
}

/* Sentiment Colors */

const sentimentStyles: Record<string, string> = {
  positive: "bg-green-500/20 text-green-400 border-green-500/40",
  neutral: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  negative: "bg-red-500/20 text-red-400 border-red-500/40",
}

const typeIcons: Record<string, any> = {
  phishing_link: Link2,
  impersonation: UserX,
  keyword_mention: Hash,
}

const platformIcons: Record<string, any> = {
  X: FaXTwitter,
}

export function ThreatFeed({ alerts }: ThreatFeedProps) {

  const [alertList, setAlertList] = useState<SocialAlert[]>(alerts || mockAlerts)
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

  const activeAlerts = alertList.filter((a) => a.status === "active")
  const resolvedAlerts = alertList.filter((a) => a.status === "resolved")

  const criticalCount = activeAlerts.filter(
    (a) => a.riskLevel === "Critical"
  ).length

  return (
    <>
      {/* HEADER */}

      <div className="mb-6">

        <h2 className="text-lg font-semibold">
          Threat Feed
        </h2>

        <p className="text-sm text-muted-foreground">
          {activeAlerts.length} active alerts{" "}
          {criticalCount > 0 && (
            <span className="text-red-400 font-medium">
              {criticalCount} critical
            </span>
          )}
        </p>

      </div>

      {/* FEED */}

      <div className="space-y-6 max-h-[520px] overflow-y-auto pr-2">

        {/* ACTIVE ALERTS */}

        {activeAlerts.map((alert) => {

          const Icon = typeIcons[alert.type]
          const PlatformIcon = platformIcons[alert.platform]

          return (
            <Card
              key={alert.id}
              className="relative rounded-xl p-6 hover:border-primary/40 transition-all"
            >

              {/* RISK INDICATOR */}

              <div
                className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
                  alert.riskLevel === "Critical"
                    ? "bg-red-500"
                    : alert.riskLevel === "High"
                    ? "bg-orange-500"
                    : alert.riskLevel === "Medium"
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />

              <div className="flex items-start justify-between gap-6">

                {/* LEFT SIDE */}

                <div className="space-y-3">

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <h3 className="font-semibold capitalize">
                      {alert.type.replace("_", " ")}
                    </h3>

                    <Badge className={`border ${riskStyles[alert.riskLevel]}`}>
                      {alert.riskLevel}
                    </Badge>

                    <Badge className={`border ${sentimentStyles[alert.sentiment]}`}>
                      {alert.sentiment}
                    </Badge>

                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {alert.content}
                  </p>

                  {/* METADATA */}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground/70">

                    <div className="flex items-center gap-1.5">
                      {PlatformIcon && <PlatformIcon className="h-3.5 w-3.5" />}
                      {alert.platform}
                    </div>

                    <span>•</span>

                    <span className="font-medium text-foreground/80">
                      {alert.keyword}
                    </span>

                    <span>•</span>

                    <span>{alert.createdAt}</span>

                  </div>

                </div>

                {/* RIGHT ACTIONS */}

                <div className="flex flex-col gap-2">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    Details
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleResolve(alert.id)}
                  >
                    Resolve
                  </Button>

                </div>

              </div>

            </Card>
          )
        })}

        {/* RESOLVED ALERTS */}

        {resolvedAlerts.length > 0 && (

          <div className="space-y-4">

            <h3 className="text-sm font-semibold text-muted-foreground uppercase">
              Resolved Alerts
            </h3>

            {resolvedAlerts.map((alert) => {

              const Icon = typeIcons[alert.type]

              return (
                <Card
                  key={alert.id}
                  className="p-6 opacity-50 grayscale"
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>

                    <h3 className="font-semibold capitalize">
                      {alert.type.replace("_", " ")}
                    </h3>

                    <Badge variant="outline">
                      Resolved
                    </Badge>

                  </div>

                  <p className="text-sm text-muted-foreground mt-2">
                    {alert.content}
                  </p>

                </Card>
              )
            })}

          </div>

        )}

      </div>

      {/* ALERT DETAILS MODAL */}

      <Dialog
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
      >

        <DialogContent className="max-w-lg rounded-xl">

          <DialogHeader>

            <div className="flex items-center gap-3">

              <DialogTitle className="capitalize">
                {selectedAlert?.type.replace("_", " ")}
              </DialogTitle>

              {selectedAlert && (
                <Badge className={`border ${riskStyles[selectedAlert.riskLevel]}`}>
                  {selectedAlert.riskLevel}
                </Badge>
              )}

            </div>

            <DialogDescription>
              Investigation information
            </DialogDescription>

          </DialogHeader>

          {selectedAlert && (

            <div className="space-y-5">

              {/* CONTENT */}

              <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
                {selectedAlert.content}
              </div>

              {/* METADATA GRID */}

              <div className="grid grid-cols-2 gap-4 text-sm">

                {/* PLATFORM */}

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {(() => {
                      const Icon = platformIcons[selectedAlert.platform]
                      return Icon ? <Icon className="h-4 w-4" /> : null
                    })()}
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Platform
                    </p>
                    <p className="font-medium">
                      {selectedAlert.platform}
                    </p>
                  </div>

                </div>

                {/* KEYWORD */}

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Hash className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Keyword
                    </p>
                    <p className="font-medium">
                      {selectedAlert.keyword}
                    </p>
                  </div>

                </div>

                {/* DETECTED */}

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Clock className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Detected
                    </p>
                    <p className="font-medium">
                      {selectedAlert.createdAt}
                    </p>
                  </div>

                </div>

                {/* AUTHOR */}

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <User className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase">
                      Author
                    </p>
                    <p className="font-medium">
                      {selectedAlert.author}
                    </p>
                  </div>

                </div>

              </div>

              {/* BADGES */}

              <div className="flex gap-3">

                <Badge className={`border ${sentimentStyles[selectedAlert.sentiment]}`}>
                  {selectedAlert.sentiment}
                </Badge>

                <Badge variant="outline">
                  {selectedAlert.status}
                </Badge>

              </div>

              {/* EXTERNAL LINK */}

              <Button variant="outline" className="w-full">
                View Original Post
              </Button>

            </div>

          )}

        </DialogContent>

      </Dialog>

    </>
  )
}