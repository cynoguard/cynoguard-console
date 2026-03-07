"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { SocialAlert } from "@/lib/types/social-alert"
import { updateMentionStatus } from "@/services/api/social-monitoring"
import { useToast } from "@/hooks/use-toast"

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog"

import { Link2, UserX, Hash, Clock, User } from "lucide-react"
import { FaXTwitter } from "react-icons/fa6"

interface ThreatFeedProps {
  alerts?: SocialAlert[]
  loading?: boolean
}

const riskStyles: Record<string, string> = {
  Critical: "bg-red-500/20 text-red-400 border-red-500/40",
  High:     "bg-orange-500/20 text-orange-400 border-orange-500/40",
  Medium:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  Low:      "bg-green-500/20 text-green-400 border-green-500/40",
}

const sentimentStyles: Record<string, string> = {
  positive: "bg-green-500/20 text-green-400 border-green-500/40",
  neutral:  "bg-gray-500/20 text-gray-300 border-gray-500/40",
  negative: "bg-red-500/20 text-red-400 border-red-500/40",
}

const typeIcons: Record<string, any> = {
  phishing_link:    Link2,
  impersonation:    UserX,
  keyword_mention:  Hash,
}

export function ThreatFeed({ alerts = [], loading = false }: ThreatFeedProps) {
  const [alertList, setAlertList] = useState<SocialAlert[]>(alerts)
  const [selectedAlert, setSelectedAlert] = useState<SocialAlert | null>(null)
  const { toast } = useToast()

  // Sync when parent passes new alerts
  if (alerts !== alertList && alerts.length > 0 && alertList.length === 0) {
    setAlertList(alerts)
  }

  async function handleResolve(alert: SocialAlert) {
    try {
      await updateMentionStatus(alert.id, "DISMISSED")
      setAlertList((prev) =>
        prev.map((a) => a.id === alert.id ? { ...a, status: "resolved" } : a)
      )
      toast({ title: "Resolved", description: "Alert marked as resolved." })
    } catch {
      toast({ title: "Error", description: "Failed to resolve alert.", variant: "destructive" })
    }
  }

  const activeAlerts = alertList.filter((a) => a.status === "active")
  const resolvedAlerts = alertList.filter((a) => a.status === "resolved")
  const criticalCount = activeAlerts.filter((a) => a.riskLevel === "Critical").length

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Threat Feed</h2>
          <p className="text-sm text-muted-foreground">Loading alerts...</p>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Threat Feed</h2>
        <p className="text-sm text-muted-foreground">
          {activeAlerts.length} active alerts{" "}
          {criticalCount > 0 && (
            <span className="font-medium text-red-400">{criticalCount} critical</span>
          )}
        </p>
      </div>

      <div className="space-y-6 max-h-[520px] overflow-y-auto pr-2">

        {activeAlerts.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            No active alerts. Upgrade X API plan to start monitoring.
          </Card>
        )}

        {activeAlerts.map((alert) => {
          const Icon = typeIcons[alert.type] ?? Hash
          return (
            <Card key={alert.id} className="relative rounded-xl p-6 hover:border-primary/40 transition-all">
              <div className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${
                alert.riskLevel === "Critical" ? "bg-red-500" :
                alert.riskLevel === "High"     ? "bg-orange-500" :
                alert.riskLevel === "Medium"   ? "bg-yellow-500" : "bg-green-500"
              }`} />

              <div className="flex items-start justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold capitalize">{alert.type.replace("_", " ")}</h3>
                    <Badge className={`border ${riskStyles[alert.riskLevel]}`}>{alert.riskLevel}</Badge>
                    <Badge className={`border ${sentimentStyles[alert.sentiment]}`}>{alert.sentiment}</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{alert.content}</p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
                    <div className="flex items-center gap-1.5">
                      <FaXTwitter className="h-3.5 w-3.5" />
                      {alert.platform}
                    </div>
                    <span>•</span>
                    <span className="font-medium text-foreground/80">{alert.author}</span>
                    {alert.keyword && <><span>•</span><span>{alert.keyword}</span></>}
                    <span>•</span>
                    <span>{alert.createdAt}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>Details</Button>
                  <Button size="sm" onClick={() => handleResolve(alert)}>Resolve</Button>
                </div>
              </div>
            </Card>
          )
        })}

        {resolvedAlerts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">Resolved Alerts</h3>
            {resolvedAlerts.map((alert) => {
              const Icon = typeIcons[alert.type] ?? Hash
              return (
                <Card key={alert.id} className="p-6 opacity-50 grayscale">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold capitalize">{alert.type.replace("_", " ")}</h3>
                    <Badge variant="outline">Resolved</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{alert.content}</p>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
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
            <DialogDescription>Investigation information</DialogDescription>
          </DialogHeader>

          {selectedAlert && (
            <div className="space-y-5">
              <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
                {selectedAlert.content}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { icon: FaXTwitter, label: "Platform", value: selectedAlert.platform },
                  { icon: Hash, label: "Keyword", value: selectedAlert.keyword || "—" },
                  { icon: Clock, label: "Detected", value: selectedAlert.createdAt },
                  { icon: User, label: "Author", value: selectedAlert.author },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs uppercase text-muted-foreground">{label}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Badge className={`border ${sentimentStyles[selectedAlert.sentiment]}`}>
                  {selectedAlert.sentiment}
                </Badge>
                <Badge variant="outline">{selectedAlert.status}</Badge>
              </div>

              {selectedAlert.sourceUrl && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={selectedAlert.sourceUrl} target="_blank" rel="noopener noreferrer">
                    View Original Post
                  </a>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}