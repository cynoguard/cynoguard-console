"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { DashboardData } from "@/lib/types/social-alert"

const COLORS = {
  positive: "#10b981",
  neutral: "#64748b",
  negative: "#ef4444",
}

interface SentimentChartProps {
  data: DashboardData | null
  loading: boolean
}

export function SentimentChart({ data, loading }: SentimentChartProps) {
  if (loading || !data) {
    return (
      <Card className="p-6 bg-card border border-border">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="mx-auto h-56 w-56 rounded-full" />
      </Card>
    )
  }

  const total =
    data.sentiment.positive +
    data.sentiment.neutral +
    data.sentiment.negative

  const chartData = [
    { name: "Positive", value: data.sentiment.positive },
    { name: "Neutral", value: data.sentiment.neutral },
    { name: "Negative", value: data.sentiment.negative },
  ]

  return (
    <Card className="p-6 bg-card border border-border">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Sentiment Distribution
      </h3>

      <div className="relative mx-auto h-[240px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: number, name: string) => {
                const percentage =
                  total > 0
                    ? ((value / total) * 100).toFixed(1)
                    : "0"

                return [
                  `${value.toLocaleString()} mentions (${percentage}%)`,
                  name,
                ]
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid hsl(var(--border))",
                backgroundColor: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
              }}
            />

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    COLORS[
                      entry.name.toLowerCase() as keyof typeof COLORS
                    ]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-foreground">
            {total.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            total
          </span>
        </div>
      </div>
    </Card>
  )
}