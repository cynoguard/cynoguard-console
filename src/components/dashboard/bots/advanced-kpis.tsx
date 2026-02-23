"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Shield, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  Users,
  Cpu,
  Database,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle
} from "lucide-react"

interface AdvancedKPICardProps {
  title: string
  subtitle: string
  value: string | number
  metrics: { label: string; value: string; change?: number; status?: "up" | "down" | "neutral" }[]
  icon: React.ReactNode
  status?: "critical" | "warning" | "success" | "info"
  trend?: "up" | "down" | "neutral"
  description?: string
  sparkline?: number[]
}

function AdvancedKPICard({ 
  title, 
  subtitle,
  value,
  metrics,
  icon, 
  status = "info",
  trend,
  description,
  sparkline
}: AdvancedKPICardProps) {
  const statusColors = {
    critical: "border-red-200 bg-red-50",
    warning: "border-orange-200 bg-orange-50", 
    success: "border-green-200 bg-green-50",
    info: "border-blue-200 bg-blue-50"
  }

  return (
    <Card className={`${statusColors[status]} relative overflow-hidden`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-gray-900">{title}</CardTitle>
          <CardDescription className="text-xs">{subtitle}</CardDescription>
        </div>
        <div className="h-10 w-10 rounded-lg bg-white/50 p-2 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          {trend && (
            <div className={`flex items-center gap-1 ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"
            }`}>
              {trend === "up" ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                {metric.change !== undefined && (
                  <span className={`text-xs ${
                    metric.status === "up" ? "text-green-600" : 
                    metric.status === "down" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {metric.status === "up" ? "↑" : metric.status === "down" ? "↓" : "→"} {Math.abs(metric.change)}%
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold">{metric.value}</div>
            </div>
          ))}
        </div>

        {description && (
          <p className="text-xs text-muted-foreground border-t pt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function AdvancedBotKPIs() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AdvancedKPICard
        title="Threat Intelligence"
        subtitle="Real-time analysis"
        value="2.4M"
        metrics={[
          { label: "New Threats", value: "45.2K", change: 18.5, status: "up" },
          { label: "Signatures", value: "128.5K", change: 5.2, status: "up" },
          { label: "Active Hunters", value: "892", change: -2.1, status: "down" },
          { label: "Coverage", value: "94.7%", change: 1.8, status: "up" }
        ]}
        icon={<Target className="h-5 w-5" />}
        status="success"
        trend="up"
        description="Global threat network | 24/7 monitoring | AI-powered detection"
      />

      <AdvancedKPICard
        title="Network Protection"
        subtitle="Infrastructure security"
        value="156"
        metrics={[
          { label: "Protected Subnets", value: "156", change: 12, status: "up" },
          { label: "Active Firewalls", value: "89", change: 3, status: "up" },
          { label: "Blocked IPs", value: "45.2K", change: 25.6, status: "up" },
          { label: "Geo-blocked", value: "23", change: -5, status: "down" }
        ]}
        icon={<Globe className="h-5 w-5" />}
        status="warning"
        trend="up"
        description="DDoS protection: 1.2Tbps | 99.99% uptime | Auto-scaling enabled"
      />

      <AdvancedKPICard
        title="API Security"
        subtitle="Endpoint protection"
        value="98.2%"
        metrics={[
          { label: "Endpoints", value: "1,245", change: 8.3, status: "up" },
          { label: "Auth Rate", value: "99.7%", change: 0.2, status: "up" },
          { label: "Abuse Rate", value: "0.3%", change: -15.8, status: "up" },
          { label: "Latency", value: "24ms", change: -8.2, status: "up" }
        ]}
        icon={<Shield className="h-5 w-5" />}
        status="success"
        trend="up"
        description="OAuth2/JWT | Rate limiting: 10K/min | WAF enabled"
      />

      <AdvancedKPICard
        title="Machine Learning"
        subtitle="AI detection models"
        value="12"
        metrics={[
          { label: "Active Models", value: "12", change: 2, status: "up" },
          { label: "Accuracy", value: "96.8%", change: 2.1, status: "up" },
          { label: "Training Data", value: "847GB", change: 125, status: "up" },
          { label: "Inferences/sec", value: "45.2K", change: 18.7, status: "up" }
        ]}
        icon={<Cpu className="h-5 w-5" />}
        status="success"
        trend="up"
        description="Deep learning | Real-time training | 99.9% availability"
      />

      <AdvancedKPICard
        title="Data Processing"
        subtitle="Stream analytics"
        value="8.7TB"
        metrics={[
          { label: "Daily Volume", value: "8.7TB", change: 22.4, status: "up" },
          { label: "Events/sec", value: "125K", change: 15.8, status: "up" },
          { label: "Storage", value: "1.2PB", change: 8.9, status: "up" },
          { label: "Retention", value: "90 days", change: 0, status: "neutral" }
        ]}
        icon={<Database className="h-5 w-5" />}
        status="info"
        trend="up"
        description="Kafka cluster | Real-time stream | Cold storage: S3"
      />

      <AdvancedKPICard
        title="System Health"
        subtitle="Infrastructure status"
        value="99.97%"
        metrics={[
          { label: "Uptime", value: "99.97%", change: 0.1, status: "up" },
          { label: "CPU Usage", value: "67%", change: -5.2, status: "up" },
          { label: "Memory", value: "72%", change: -3.1, status: "up" },
          { label: "Response", value: "142ms", change: -12.4, status: "up" }
        ]}
        icon={<Activity className="h-5 w-5" />}
        status="success"
        trend="up"
        description="Kubernetes cluster | 32 nodes | Auto-healing enabled"
      />
    </div>
  )
}
