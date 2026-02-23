"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Shield, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  Users,
  Globe,
  BarChart3,
  CheckCircle
} from "lucide-react"

const rulePerformance = [
  { name: "Block High-Frequency", effectiveness: 94, falsePositives: 0.2, matches: 1250, coverage: 87, latency: 8 },
  { name: "User Agent Detection", effectiveness: 87, falsePositives: 1.1, matches: 847, coverage: 92, latency: 12 },
  { name: "Geographic Blocking", effectiveness: 72, falsePositives: 0.5, matches: 0, coverage: 45, latency: 5 },
  { name: "API Protection", effectiveness: 91, falsePositives: 0.3, matches: 342, coverage: 78, latency: 15 },
]

const timelineData = [
  { date: "Mon", blocked: 450, falsePositives: 12, total: 2340, accuracy: 99.5, latency: 11 },
  { date: "Tue", blocked: 520, falsePositives: 8, total: 2560, accuracy: 99.7, latency: 10 },
  { date: "Wed", blocked: 480, falsePositives: 15, total: 2450, accuracy: 99.4, latency: 13 },
  { date: "Thu", blocked: 590, falsePositives: 6, total: 2780, accuracy: 99.8, latency: 9 },
  { date: "Fri", blocked: 670, falsePositives: 10, total: 3120, accuracy: 99.7, latency: 12 },
  { date: "Sat", blocked: 380, falsePositives: 4, total: 1890, accuracy: 99.8, latency: 8 },
  { date: "Sun", blocked: 320, falsePositives: 3, total: 1650, accuracy: 99.8, latency: 7 },
]

const ruleCategories = [
  { name: "Rate Limiting", value: 35, color: "#3b82f6", effectiveness: 91, rules: 4 },
  { name: "Pattern Matching", value: 28, color: "#ef4444", effectiveness: 87, rules: 3 },
  { name: "Geolocation", value: 20, color: "#22c55e", effectiveness: 72, rules: 2 },
  { name: "Behavioral", value: 17, color: "#f97316", effectiveness: 89, rules: 3 },
]

const topRules = [
  {
    id: "rule-001",
    name: "Block High-Frequency Requests",
    category: "Rate Limiting",
    effectiveness: 94,
    trend: "up",
    change: 5.2,
    blocked: 1250,
    falsePositives: 0.2,
    coverage: 87,
    latency: 8,
    status: "optimal"
  },
  {
    id: "rule-002",
    name: "Suspicious User Agent Detection", 
    category: "Pattern Matching",
    effectiveness: 87,
    trend: "down",
    change: -2.1,
    blocked: 847,
    falsePositives: 1.1,
    coverage: 92,
    latency: 12,
    status: "good"
  },
  {
    id: "rule-003",
    name: "API Endpoint Protection",
    category: "Behavioral",
    effectiveness: 91,
    trend: "up",
    change: 3.8,
    blocked: 342,
    falsePositives: 0.3,
    coverage: 78,
    latency: 15,
    status: "optimal"
  }
]

const enterpriseMetrics = [
  {
    title: "Total Blocked",
    value: "3.4M",
    subtitle: "Last 30 days",
    change: 18.5,
    trend: "up",
    icon: <Target className="h-5 w-5" />,
    status: "success",
    description: "Above target by 15%"
  },
  {
    title: "Detection Accuracy",
    value: "99.6%",
    subtitle: "True positive rate",
    change: 0.8,
    trend: "up",
    icon: <Shield className="h-5 w-5" />,
    status: "success",
    description: "Industry leading"
  },
  {
    title: "False Positive Rate",
    value: "0.4%",
    subtitle: "Of total detections",
    change: -25.0,
    trend: "up",
    icon: <AlertTriangle className="h-5 w-5" />,
    status: "success",
    description: "Below SLA threshold"
  },
  {
    title: "Avg Response Time",
    value: "11ms",
    subtitle: "Detection latency",
    change: -8.3,
    trend: "up",
    icon: <Zap className="h-5 w-5" />,
    status: "success",
    description: "Within SLA targets"
  }
]

function EnterpriseMetricCard({ metric }: { metric: typeof enterpriseMetrics[0] }) {
  const statusColors = {
    success: "border-green-200 bg-green-50",
    warning: "border-orange-200 bg-orange-50", 
    critical: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50"
  }

  return (
    <Card className={`${statusColors[metric.status]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-gray-900">{metric.title}</CardTitle>
          <CardDescription className="text-xs">{metric.subtitle}</CardDescription>
        </div>
        <div className="h-10 w-10 rounded-lg bg-white/50 p-2 text-muted-foreground">
          {metric.icon}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {metric.trend === "up" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : (
              <ArrowDownRight className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(metric.change)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            vs last period
          </span>
        </div>

        <p className="text-xs text-muted-foreground border-t pt-2">{metric.description}</p>
      </CardContent>
    </Card>
  )
}

export function RuleAnalytics() {
  const totalBlocked = timelineData.reduce((sum, item) => sum + item.blocked, 0)
  const totalFalsePositives = timelineData.reduce((sum, item) => sum + item.falsePositives, 0)
  const accuracyRate = ((totalBlocked - totalFalsePositives) / totalBlocked * 100).toFixed(1)

  return (
    <div className="space-y-8">
      {/* Enterprise Metrics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {enterpriseMetrics.map((metric, index) => (
          <EnterpriseMetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Advanced Performance Analytics
                </CardTitle>
                <CardDescription>
                  Comprehensive rule performance metrics over time
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  SLA Met
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="blocked"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Blocked Requests"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="falsePositives"
                  stackId="2"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.8}
                  name="False Positives"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Accuracy %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rule Categories Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Performance
            </CardTitle>
            <CardDescription>
              Effectiveness by rule category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ruleCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent, effectiveness }: { name: string; percent: number; effectiveness: number }) => 
                    `${name} ${(percent * 100).toFixed(0)}% (${effectiveness}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ruleCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rule Performance Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Rule Efficiency Matrix
            </CardTitle>
            <CardDescription>
              Effectiveness vs coverage analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rulePerformance.map((rule, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{rule.name}</span>
                    <Badge variant={rule.effectiveness >= 90 ? "default" : rule.effectiveness >= 80 ? "secondary" : "destructive"}>
                      {rule.effectiveness}% effective
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Effectiveness</span>
                        <span>{rule.effectiveness}%</span>
                      </div>
                      <Progress value={rule.effectiveness} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Coverage</span>
                        <span>{rule.coverage}%</span>
                      </div>
                      <Progress value={rule.coverage} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Rules Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Enterprise Rule Performance
              </CardTitle>
              <CardDescription>
                Detailed analysis of top-performing detection rules
              </CardDescription>
            </div>
            <Badge variant="outline">
              {topRules.length} Active Rules
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      rule.status === "optimal" ? "bg-green-500" : "bg-blue-500"
                    }`} />
                    <div>
                      <p className="font-semibold">{rule.name}</p>
                      <p className="text-sm text-muted-foreground">{rule.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{rule.effectiveness}%</p>
                      <p className="text-xs text-muted-foreground">Effectiveness</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {rule.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        rule.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {Math.abs(rule.change)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Blocked</p>
                    <p className="font-semibold">{rule.blocked.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">False Positives</p>
                    <p className="font-semibold">{rule.falsePositives}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coverage</p>
                    <p className="font-semibold">{rule.coverage}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Latency</p>
                    <p className="font-semibold">{rule.latency}ms</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
