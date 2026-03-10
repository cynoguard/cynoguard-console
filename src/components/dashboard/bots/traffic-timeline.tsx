"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Clock } from "lucide-react"

const detectionTimeline = [
  { time: "00:00", requests: 1200, blocked: 180, suspicious: 45 },
  { time: "04:00", requests: 800, blocked: 120, suspicious: 30 },
  { time: "08:00", requests: 2400, blocked: 360, suspicious: 90 },
  { time: "12:00", requests: 3200, blocked: 480, suspicious: 120 },
  { time: "16:00", requests: 2800, blocked: 420, suspicious: 105 },
  { time: "20:00", requests: 1800, blocked: 270, suspicious: 68 },
]

export function TrafficTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Traffic Timeline
        </CardTitle>
        <CardDescription>
          Request volume vs blocked attempts over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={detectionTimeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="requests"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total Requests"
            />
            <Area
              type="monotone"
              dataKey="blocked"
              stackId="2"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.8}
              name="Blocked"
            />
            <Area
              type="monotone"
              dataKey="suspicious"
              stackId="3"
              stroke="#f97316"
              fill="#f97316"
              fillOpacity={0.8}
              name="Suspicious"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
