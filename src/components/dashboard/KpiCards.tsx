"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  MessageSquare,
  CalendarClock,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react"
import type { DashboardData } from "@/lib/types/social-alert"

interface KpiCardsProps {
  data: DashboardData | null
  loading: boolean
}

export function KpiCards({ data, loading }: KpiCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card
            key={`kpi-sk-${i}`}
            className="p-4 bg-card border border-border"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  const total = data.totalMentions
  const positivePct =
    total > 0 ? ((data.sentiment.positive / total) * 100).toFixed(1) : "0"
  const negativePct =
    total > 0 ? ((data.sentiment.negative / total) * 100).toFixed(1) : "0"
  const neutralPct =
    total > 0 ? ((data.sentiment.neutral / total) * 100).toFixed(1) : "0"

  const cards = [
    {
      label: "Total Mentions",
      value: total.toLocaleString(),
      sub: "All time",
      icon: MessageSquare,
      iconBg: "bg-blue-500/15 text-blue-400",
    },
    {
      label: "Mentions Today",
      value: data.mentionsToday.toLocaleString(),
      sub: "Last 24 hours",
      icon: CalendarClock,
      iconBg: "bg-violet-500/15 text-violet-400",
    },
    {
      label: "Positive",
      value: data.sentiment.positive.toLocaleString(),
      sub: `${positivePct}% of total`,
      icon: ThumbsUp,
      iconBg: "bg-emerald-500/15 text-emerald-400",
    },
    {
      label: "Negative",
      value: data.sentiment.negative.toLocaleString(),
      sub: `${negativePct}% of total`,
      icon: ThumbsDown,
      iconBg: "bg-red-500/15 text-red-400",
    },
    {
      label: "Neutral",
      value: data.sentiment.neutral.toLocaleString(),
      sub: `${neutralPct}% of total`,
      icon: Minus,
      iconBg: "bg-slate-500/15 text-slate-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Card
          key={c.label}
          className="flex items-center gap-3 p-4 bg-card border border-border hover:border-muted-foreground/30 transition-all"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.iconBg}`}
          >
            <c.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">
              {c.value}
            </p>
            <p className="text-xs text-muted-foreground">
              {c.label}
              <span className="ml-1.5 text-muted-foreground/70">
                {c.sub}
              </span>
            </p>
          </div>
        </Card>
      ))}
    </div>
  )
}