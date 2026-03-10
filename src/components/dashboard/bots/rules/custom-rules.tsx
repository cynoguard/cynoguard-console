"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Shield, AlertTriangle, CheckCircle } from "lucide-react"

const customRules = [
  {
    id: "rule-001",
    name: "Block High-Frequency Requests",
    description: "Block IPs making more than 100 requests per minute",
    type: "Rate Limiting",
    severity: "High",
    status: "active",
    matches: 1250,
    lastTriggered: "2 min ago"
  },
  {
    id: "rule-002", 
    name: "Suspicious User Agent Detection",
    description: "Identify and block known malicious user agents",
    type: "Pattern Matching",
    severity: "Medium",
    status: "active",
    matches: 847,
    lastTriggered: "15 min ago"
  },
  {
    id: "rule-003",
    name: "Geographic Blocking",
    description: "Block requests from high-risk countries",
    type: "Geolocation",
    severity: "Low",
    status: "inactive",
    matches: 0,
    lastTriggered: "Never"
  },
  {
    id: "rule-004",
    name: "API Endpoint Protection",
    description: "Protect sensitive API endpoints from automated access",
    type: "Endpoint Protection",
    severity: "High",
    status: "active",
    matches: 342,
    lastTriggered: "8 min ago"
  }
]

const severityColors: Record<string, "destructive" | "default" | "secondary"> = {
  High: "destructive",
  Medium: "default", 
  Low: "secondary"
}

const statusIcons: Record<string, React.ReactNode> = {
  active: <CheckCircle className="h-4 w-4 text-green-600" />,
  inactive: <AlertTriangle className="h-4 w-4 text-gray-400" />
}

export function CustomRules() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Custom Rules Management
            </CardTitle>
            <CardDescription>
              Create and manage custom bot detection rules
            </CardDescription>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customRules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcons[rule.status]}
                  <div>
                    <h3 className="font-semibold">{rule.name}</h3>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.status === "active"} />
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <Badge variant={severityColors[rule.severity]}>
                  {rule.severity}
                </Badge>
                <span className="text-muted-foreground">Type: {rule.type}</span>
                <span className="text-muted-foreground">Matches: {rule.matches}</span>
                <span className="text-muted-foreground">Last: {rule.lastTriggered}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
