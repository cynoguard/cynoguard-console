"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Activity, 
  Ban, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Clock,
  Target,
  BarChart3
} from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  description?: string
  trend?: "up" | "down" | "neutral"
  progress?: number
  target?: string
  status?: "critical" | "warning" | "success" | "info"
  breakdown?: { label: string; value: string; color: string }[]
}

function KPICard({ 
  title, 
  value, 
  subtitle,
  change, 
  changeLabel,
  icon, 
  description, 
  trend = "neutral",
  progress,
  target,
  status = "info",
  breakdown
}: KPICardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600", 
    neutral: "text-gray-600"
  }

  const statusColors = {
    critical: "border-red-200 bg-red-50",
    warning: "border-orange-200 bg-orange-50", 
    success: "border-green-200 bg-green-50",
    info: "border-blue-200 bg-blue-50"
  }

  const statusIcons = {
    up: <ArrowUpRight className="h-4 w-4" />,
    down: <ArrowDownRight className="h-4 w-4" />,
    neutral: <Minus className="h-4 w-4" />
  }

  return (
    <Card className={`relative overflow-hidden ${statusColors[status]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-gray-900">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/50 p-1.5 text-muted-foreground">
            {icon}
          </div>
          {status !== "info" && (
            <Badge 
              variant={status === "critical" ? "destructive" : status === "warning" ? "default" : "secondary"}
              className="text-xs"
            >
              {status.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {target && (
            <span className="text-sm text-muted-foreground">/ {target}</span>
          )}
        </div>
        
        {change !== undefined && (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 ${trendColors[trend]}`}>
              {statusIcons[trend]}
              <span className="text-sm font-medium">
                {Math.abs(change)}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {changeLabel || "from last period"}
            </span>
          </div>
        )}

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {breakdown && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Breakdown</p>
            <div className="flex gap-2">
              {breakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.label}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {description && (
          <p className="text-xs text-muted-foreground border-t pt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function BotKPIs() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Requests"
        subtitle="Last 24 hours"
        value="12.2M"
        change={12.5}
        changeLabel="vs yesterday"
        trend="up"
        icon={<Activity className="h-4 w-4" />}
        status="success"
        progress={78}
        target="15.6M"
        breakdown={[
          { label: "Legitimate", value: "10.4M", color: "#22c55e" },
          { label: "Suspicious", value: "1.8M", color: "#f97316" }
        ]}
        description="Peak: 14:00-16:00 UTC | Avg: 508K/hr"
      />
      
      <KPICard
        title="Blocked Bots"
        subtitle="Automated threats"
        value="1.8M"
        change={8.2}
        changeLabel="vs last week"
        trend="up"
        icon={<Ban className="h-4 w-4" />}
        status="warning"
        progress={92}
        target="2.0M"
        breakdown={[
          { label: "Critical", value: "432K", color: "#ef4444" },
          { label: "High", value: "892K", color: "#f97316" },
          { label: "Medium", value: "476K", color: "#eab308" }
        ]}
        description="Block rate: 14.8% | 75K/hr avg | Peak: 125K/hr"
      />
      
      <KPICard
        title="Detection Accuracy"
        subtitle="True positive rate"
        value="98.5%"
        change={0.3}
        changeLabel="vs last month"
        trend="up"
        icon={<Shield className="h-4 w-4" />}
        status="success"
        progress={98.5}
        breakdown={[
          { label: "True Pos", value: "1.77M", color: "#22c55e" },
          { label: "False Pos", value: "27K", color: "#ef4444" }
        ]}
        description="Industry: 95% | Rank: Top 5% | SLA: 99% met"
      />
      
      <KPICard
        title="Response Time"
        subtitle="Average detection latency"
        value="12ms"
        change={-15.2}
        changeLabel="vs last hour"
        trend="up"
        icon={<Zap className="h-4 w-4" />}
        status="success"
        progress={95}
        target="<10ms"
        breakdown={[
          { label: "P50", value: "8ms", color: "#22c55e" },
          { label: "P95", value: "24ms", color: "#f97316" },
          { label: "P99", value: "45ms", color: "#ef4444" }
        ]}
        description="SLA: <50ms for 99.9% | Best: 3ms | Worst: 67ms"
      />
    </div>
  )
}
