"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Globe } from "lucide-react"

const threatSources = [
  { country: "United States", attacks: 1240, trend: "up" },
  { country: "China", attacks: 890, trend: "down" },
  { country: "Russia", attacks: 756, trend: "up" },
  { country: "Brazil", attacks: 543, trend: "up" },
  { country: "India", attacks: 432, trend: "down" },
]

export function ThreatSources() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Top Threat Sources
        </CardTitle>
        <CardDescription>
          Geographic distribution of attack origins
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={threatSources}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="country" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="attacks" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
