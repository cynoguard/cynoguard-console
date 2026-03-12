"use client"

import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig,
} from "@/components/ui/chart"
import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

type PieDataItem = {
  name:  string
  value: number
  fill:  string
}

type Props = {
  data?:         PieDataItem[]
  loading?:      boolean
  title?:        string
  description?:  string
  centerLabel?:  string
  centerValue?:  string | number
}

export function ChartPieDonutText({
  data         = [],
  loading      = false,
  title        = "Action Breakdown",
  description  = "Detection outcomes",
  centerLabel  = "Total",
  centerValue  = "0",
}: Props) {

  // Build ChartConfig dynamically from data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: "Count" },
    }
    data.forEach((item) => {
      config[item.name.toLowerCase()] = {
        label: item.name,
        color: item.fill,
      }
    })
    return config
  }, [data])

  // Normalize data — Recharts Pie needs dataKey="value" and nameKey="name"
  const chartData = data.map((item) => ({
    name:  item.name,
    value: item.value,
    fill:  item.fill,
  }))

  if (loading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          <div className="h-3 w-40 bg-zinc-800 rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="flex-1 pb-0 flex items-center justify-center">
          <div className="w-[200px] h-[200px] rounded-full bg-zinc-900/50 animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {centerValue}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1 text-sm">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: item.fill }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium tabular-nums">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </CardFooter>
    </Card>
  )
}