"use client"

import { Badge } from "@/components/ui/badge"
import { Shield } from "lucide-react"
import { BotKPIs } from "./dashboard/bots/bot-kpis"
import { AdvancedBotKPIs } from "./dashboard/bots/advanced-kpis"
import { TrafficTimeline } from "./dashboard/bots/traffic-timeline"
import { BotTypesDistribution } from "./dashboard/bots/bot-types-distribution"
import { ThreatSources } from "./dashboard/bots/threat-sources"
import { PerformanceMetrics } from "./dashboard/bots/performance-metrics"
import { RecentActivity } from "./dashboard/bots/recent-activity"

export default function BotDetectionDashboard() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bot Detection</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analysis of automated traffic threats
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Shield className="w-3 h-3 mr-1" />
          System Active
        </Badge>
      </div>

      {/* Core KPIs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Core Metrics</h2>
        <BotKPIs />
      </div>

      {/* Advanced KPIs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Advanced Analytics</h2>
        <AdvancedBotKPIs />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <TrafficTimeline />
        <BotTypesDistribution />
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <ThreatSources />
        <PerformanceMetrics />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  )
}
