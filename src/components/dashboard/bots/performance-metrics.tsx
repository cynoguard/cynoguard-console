"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu } from "lucide-react"

const performanceMetrics = [
  { metric: "Detection Rate", value: 98.5, unit: "%" },
  { metric: "False Positives", value: 0.2, unit: "%" },
  { metric: "Response Time", value: 12, unit: "ms" },
  { metric: "Blocked Requests", value: 1847, unit: "K" },
]

export function PerformanceMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          System performance and efficiency indicators
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">{metric.metric}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold">{metric.value}</span>
                <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
