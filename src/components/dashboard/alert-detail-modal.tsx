"use client"

import type { SocialAlert } from "@/lib/types/social-alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  Clock,
  Hash,
  MessageSquare,
  User,
} from "lucide-react"

const riskColors: Record<string, string> = {
  Low: "bg-green-500/15 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Critical: "bg-red-500/15 text-red-400 border-red-500/30",
}

const sentimentColors: Record<string, string> = {
  positive: "bg-green-500/15 text-green-400 border-green-500/30",
  neutral: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  negative: "bg-red-500/15 text-red-400 border-red-500/30",
}

const typeLabels: Record<string, string> = {
  keyword_mention: "Keyword Mention",
  phishing_link: "Phishing Link",
  impersonation: "Impersonation",
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Unknown"
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface AlertDetailModalProps {
  alert: SocialAlert | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlertDetailModal({
  alert,
  open,
  onOpenChange,
}: AlertDetailModalProps) {

  if (!alert) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-black sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <span>{typeLabels[alert.type] ?? alert.type}</span>

            <Badge
              variant="outline"
              className={riskColors[alert.riskLevel] ?? ""}
            >
              {alert.riskLevel}
            </Badge>
          </DialogTitle>

          <DialogDescription className="sr-only">
            Details for alert {alert.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">

          {/* Alert Content */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm leading-relaxed text-white/70">
              {alert.content}
            </p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">

            {/* Platform */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                <MessageSquare className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Platform
                </p>
                <p className="text-sm font-medium text-white">
                  {alert.platform ?? "Unknown"}
                </p>
              </div>
            </div>

            {/* Keyword */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                <Hash className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Keyword
                </p>
                <p className="text-sm font-medium text-white">
                  {alert.keyword ?? "Unknown"}
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                <Clock className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Detected
                </p>
                <p className="text-sm font-medium text-white">
                  {formatDate(alert.createdAt)}
                </p>
              </div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                <User className="h-4 w-4 text-white/40" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Author
                </p>
                <p className="text-sm font-medium text-white">
                  {alert.author ?? "Unknown"}
                </p>
              </div>
            </div>

          </div>

          {/* Sentiment + Status */}
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={sentimentColors[alert.sentiment] ?? ""}
            >
              {alert.sentiment}
            </Badge>

            <Badge
              variant="outline"
              className={
                alert.status === "resolved"
                  ? "bg-white/10 text-white/60 border-white/20"
                  : "bg-blue-500/15 text-blue-400 border-blue-500/30"
              }
            >
              {alert.status}
            </Badge>
          </div>

          {/* Source Link */}
          {alert.sourceUrl && (
            <Button
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10"
              asChild
            >
              <a
                href={alert.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Original Post
              </a>
            </Button>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}