"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Users, Globe, Shield, Clock } from "lucide-react"

const whitelistEntries = [
  {
    id: "wl-001",
    type: "IP Address",
    value: "192.168.1.100",
    description: "Internal monitoring server",
    category: "Internal",
    status: "active",
    addedDate: "2024-01-15",
    lastAccessed: "2 hours ago",
    requests: 15420
  },
  {
    id: "wl-002",
    type: "User Agent",
    value: "GoogleBot/2.1",
    description: "Legitimate Google crawler",
    category: "Search Engine",
    status: "active",
    addedDate: "2024-01-10",
    lastAccessed: "30 min ago",
    requests: 8932
  },
  {
    id: "wl-003",
    type: "Domain",
    value: "api.trusted-partner.com",
    description: "Verified API partner",
    category: "Partner",
    status: "active",
    addedDate: "2024-01-08",
    lastAccessed: "5 min ago",
    requests: 12450
  },
  {
    id: "wl-004",
    type: "IP Range",
    value: "10.0.0.0/24",
    description: "Office network range",
    category: "Internal",
    status: "inactive",
    addedDate: "2024-01-05",
    lastAccessed: "2 days ago",
    requests: 5678
  }
]

const typeIcons: Record<string, React.ReactNode> = {
  "IP Address": <Globe className="h-4 w-4" />,
  "User Agent": <Users className="h-4 w-4" />,
  "Domain": <Shield className="h-4 w-4" />,
  "IP Range": <Globe className="h-4 w-4" />
}

const categoryColors: Record<string, "default" | "secondary" | "outline"> = {
  "Internal": "default",
  "Search Engine": "secondary",
  "Partner": "outline"
}

export function WhitelistManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Whitelist Management
            </CardTitle>
            <CardDescription>
              Manage trusted IPs, domains, and user agents
            </CardDescription>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {whitelistEntries.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {typeIcons[entry.type]}
                  <div>
                    <h3 className="font-semibold">{entry.value}</h3>
                    <p className="text-sm text-muted-foreground">{entry.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={entry.status === "active" ? "default" : "secondary"}>
                    {entry.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{entry.type}</span>
                <Badge variant={categoryColors[entry.category]}>
                  {entry.category}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Added: {entry.addedDate}
                </span>
                <span>Requests: {entry.requests.toLocaleString()}</span>
                <span>Last: {entry.lastAccessed}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
