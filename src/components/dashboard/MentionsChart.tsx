"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { DashboardData } from "@/lib/types/social-alert"

const chartConfig: ChartConfig = {
  count: { label: "Mentions", color: "#3b82f6" },
}

interface MentionsChartProps {
  data: DashboardData | null
  loading: boolean
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export function MentionsChart({
  data,
  loading,
}: MentionsChartProps) {
  if (loading || !data) {
    return (
      <Card className="p-6 bg-card border border-border">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-52 w-full rounded-lg" />
      </Card>
    )
  }

  const chartData = data.mentionsPerDay.map((d) => ({
    ...d,
    label: formatDateLabel(d.date),
  }))

  return (
    <Card className="p-6 bg-card border border-border">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Mentions Over Time
      </h3>

      <ChartContainer
        config={chartConfig}
        className="aspect-[2/1] w-full max-h-[240px]"
      >
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
          />

          <ChartTooltip content={<ChartTooltipContent />} />

          <defs>
            <linearGradient
              id="mentionsFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#3b82f6"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="#3b82f6"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#mentionsFill)"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}