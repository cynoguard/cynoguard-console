"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

const recentEvents = [
  { type: "Web Scraper", source: "192.168.1.100", target: "/api/products", status: "blocked", time: "2 min ago" },
  { type: "Credential Stuffing", source: "10.0.0.45", target: "/login", status: "blocked", time: "5 min ago" },
  { type: "DDoS Attack", source: "172.16.0.23", target: "/api/data", status: "mitigated", time: "12 min ago" },
  { type: "Spam Bot", source: "203.0.113.1", target: "/contact", status: "blocked", time: "18 min ago" },
  { type: "Suspicious Activity", source: "198.51.100.0", target: "/admin", status: "monitoring", time: "25 min ago" },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Recent Bot Detection Events
        </CardTitle>
        <CardDescription>
          Latest automated threats identified and blocked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={event.status === "blocked" ? "destructive" : event.status === "mitigated" ? "default" : "secondary"}>
                  {event.status}
                </Badge>
                <div>
                  <p className="font-medium">{event.type}</p>
                  <p className="text-sm text-muted-foreground">
                    {event.source} → {event.target}
                  </p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{event.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
