/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer, ChartLegend, ChartLegendContent,
  ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart"
import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

type Props = {
  data?:        Record<string, any>[]
  loading?:     boolean
  dataKeys?:    string[]
  colors?:      Record<string, string>
  title?:       string
  description?: string
}

const DEFAULT_COLORS: Record<string, string> = {
  allow:     "hsl(142, 70%, 45%)",
  challenge: "hsl(0, 70%, 55%)",
  uncertain: "hsl(45, 90%, 55%)",
}

export function ChartAreaInteractive({
  data        = [],
  loading     = false,
  dataKeys    = ["allow", "challenge", "uncertain"],
  colors      = DEFAULT_COLORS,
  title       = "Traffic Over Time",
  description = "Bot vs human request distribution",
}: Props) {

  // Build ChartConfig dynamically from dataKeys + colors
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    dataKeys.forEach((key) => {
      config[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: colors[key] ?? "hsl(220, 10%, 50%)",
      }
    })
    return config
  }, [dataKeys, colors])

  // Build gradient defs dynamically
  const gradients = dataKeys.map((key) => (
    <linearGradient key={key} id={`fill_${key}`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor={colors[key] ?? "#888"} stopOpacity={0.8} />
      <stop offset="95%" stopColor={colors[key] ?? "#888"} stopOpacity={0.1} />
    </linearGradient>
  ))

  if (loading) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-48 bg-zinc-800 rounded animate-pulse mt-1" />
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="h-[250px] w-full bg-zinc-900/50 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={data}>
            <defs>{gradients}</defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                // already pre-formatted as "May 1" from transformer
                // but handle raw ISO dates as fallback
                if (value.includes("-")) {
                  return new Date(value).toLocaleDateString("en-US", {
                    month: "short", day: "numeric",
                  })
                }
                return value
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
            />
            {dataKeys.map((key, i) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#fill_${key})`}
                stroke={colors[key] ?? "#888"}
                stackId="a"
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}