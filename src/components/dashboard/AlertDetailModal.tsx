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
  Low: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  High: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Critical: "bg-red-500/10 text-red-600 border-red-500/20",
}

const sentimentColors: Record<string, string> = {
  positive: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  neutral: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  negative: "bg-red-500/10 text-red-600 border-red-500/20",
}

const typeLabels: Record<string, string> = {
  keyword_mention: "Keyword Mention",
  phishing_link: "Phishing Link",
  impersonation: "Impersonation",
}

function formatDate(dateStr: string) {
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

export function AlertDetailModal({ alert, open, onOpenChange }: AlertDetailModalProps) {
  if (!alert) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <span>{typeLabels[alert.type]}</span>
            <Badge
              variant="outline"
              className={riskColors[alert.riskLevel]}
            >
              {alert.riskLevel}
            </Badge>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details for alert {alert.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {/* Content */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm leading-relaxed text-slate-700">{alert.content}</p>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                <MessageSquare className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Platform</p>
                <p className="text-sm font-medium text-slate-900">{alert.platform}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                <Hash className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Keyword</p>
                <p className="text-sm font-medium text-slate-900">{alert.keyword}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                <Clock className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Detected</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(alert.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Author</p>
                <p className="text-sm font-medium text-slate-900">{alert.author || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Sentiment & Status */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={sentimentColors[alert.sentiment]}>
              {alert.sentiment}
            </Badge>
            <Badge
              variant="outline"
              className={
                alert.status === "resolved"
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
              }
            >
              {alert.status}
            </Badge>
          </div>

          {/* Source link */}
          {alert.sourceUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer">
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
