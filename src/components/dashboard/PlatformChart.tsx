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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import type { DashboardData } from "@/lib/types/social-alert"

const PLATFORM_COLORS: Record<string, string> = {
  REDDIT: "#ff4500",
  X: "#ffffff",
}

const chartConfig: ChartConfig = {
  count: { label: "Mentions", color: "#3b82f6" },
}

interface PlatformChartProps {
  data: DashboardData | null
  loading: boolean
}

export function PlatformChart({
  data,
  loading,
}: PlatformChartProps) {
  if (loading || !data) {
    return (
      <Card className="p-6 bg-card border border-border">
        <Skeleton className="mb-4 h-5 w-40" />
        <Skeleton className="h-52 w-full rounded-lg" />
      </Card>
    )
  }

  const total = Object.values(
    data.platformDistribution
  ).reduce((a, b) => a + b, 0)

  const chartData = Object.entries(
    data.platformDistribution
  ).map(([platform, count]) => ({
    platform,
    count,
    fill: PLATFORM_COLORS[platform] || "#64748b",
    pct:
      total > 0
        ? ((count / total) * 100).toFixed(1)
        : "0",
  }))

  return (
    <Card className="p-6 bg-card border border-border">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Platform Distribution
      </h3>

      <ChartContainer
        config={chartConfig}
        className="aspect-[2/1] w-full max-h-[240px]"
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="hsl(var(--border))"
          />

          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
          />

          <YAxis
            dataKey="platform"
            type="category"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 12,
              fill: "hsl(var(--foreground))",
              fontWeight: 500,
            }}
            width={80}
          />

          <ChartTooltip content={<ChartTooltipContent />} />

          <Bar
            dataKey="count"
            radius={[0, 6, 6, 0]}
            barSize={28}
          />
        </BarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6">
        {chartData.map((entry) => (
          <div
            key={entry.platform}
            className="flex items-center gap-1.5 text-xs"
          >
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: entry.fill }}
            />
            <span className="text-muted-foreground">
              {entry.platform}
            </span>
            <span className="font-medium text-foreground">
              {entry.pct}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}