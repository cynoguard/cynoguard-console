"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { Bot } from "lucide-react"

const botTypes = [
  { name: "Web Scrapers", value: 35, color: "#ef4444" },
  { name: "Credential Stuffing", value: 28, color: "#f97316" },
  { name: "DDoS Bots", value: 20, color: "#eab308" },
  { name: "Spam Bots", value: 12, color: "#22c55e" },
  { name: "Others", value: 5, color: "#6b7280" },
]

export function BotTypesDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Bot Types Distribution
        </CardTitle>
        <CardDescription>
          Classification of detected bot types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={botTypes}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {botTypes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
