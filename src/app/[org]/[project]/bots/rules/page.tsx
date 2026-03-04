"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  Cpu,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2
} from "lucide-react"
import { useState } from "react"

export default function ProtectionRulesPage() {
  const [activeMode, setActiveMode] = useState("balanced")

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-zinc-100 p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Protection Rules</h1>
          </div>
          <p className="text-muted-foreground">Configure machine learning sensitivity and manage trust lists.</p>
        </div>
        <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/5 h-fit py-1">
          <div className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          ML Model: V2.4 Active
        </Badge>
      </div>

      <Tabs defaultValue="ml-config" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="ml-config" className="data-[state=active]:bg-zinc-800">ML Control</TabsTrigger>
          <TabsTrigger value="whitelist" className="data-[state=active]:bg-zinc-800">Whitelist</TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-zinc-800">Custom Signatures</TabsTrigger>
        </TabsList>

        {/* Tab 1: ML Configuration */}
        <TabsContent value="ml-config" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Passive Mode */}
            <Card 
              className={`cursor-pointer transition-all border-zinc-800 bg-zinc-950 hover:border-zinc-700 ${activeMode === 'passive' ? 'ring-2 ring-zinc-400' : ''}`}
              onClick={() => setActiveMode("passive")}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Shield className="h-8 w-8 text-zinc-500" />
                  <Badge variant="outline" className="text-[10px]">MONITORING ONLY</Badge>
                </div>
                <CardTitle className="mt-4 text-lg">Passive</CardTitle>
                <CardDescription>Log all threats but never block or challenge. Best for initial setup.</CardDescription>
              </CardHeader>
            </Card>

            {/* Balanced Mode */}
            <Card 
              className={`cursor-pointer transition-all border-zinc-800 bg-zinc-950 hover:border-zinc-600 ${activeMode === 'balanced' ? 'ring-2 ring-white' : ''}`}
              onClick={() => setActiveMode("balanced")}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <ShieldCheck className="h-8 w-8 text-blue-500" />
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20">RECOMMENDED</Badge>
                </div>
                <CardTitle className="mt-4 text-lg">Balanced</CardTitle>
                <CardDescription>Challenge suspicious traffic. High accuracy with low human friction.</CardDescription>
              </CardHeader>
            </Card>

            {/* Aggressive Mode */}
            <Card 
              className={`cursor-pointer transition-all border-zinc-800 bg-zinc-950 hover:border-zinc-700 ${activeMode === 'aggressive' ? 'ring-2 ring-red-500' : ''}`}
              onClick={() => setActiveMode("aggressive")}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <ShieldAlert className="h-8 w-8 text-red-500" />
                  <Badge variant="destructive">MAX SECURITY</Badge>
                </div>
                <CardTitle className="mt-4 text-lg">Aggressive</CardTitle>
                <CardDescription>Immediate block for medium-risk signals. Minimal false-positive tolerance.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-zinc-400" /> ML Signal Weights
              </CardTitle>
              <CardDescription>Adjust how our model interprets specific behavioral signals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Headless Browser Detection", desc: "Flag Selenium, Puppeteer, and Playwright signatures." },
                { label: "Hardware Mismatch", desc: "Validate CPU cores against RAM and Canvas rendering." },
                { label: "Touch/Mouse Path Analysis", desc: "Detect non-human, linear cursor movements." }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Whitelist Management */}
        <TabsContent value="whitelist" className="space-y-6">
          <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle>Global Whitelist</CardTitle>
                <CardDescription>Always allow these entities to bypass bot detection.</CardDescription>
              </div>
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                <Plus className="h-4 w-4 mr-2" /> Add Entry
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input placeholder="Search IPs or User Agents..." className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-300" />
              </div>

              <div className="space-y-3">
                {[
                  { name: "Googlebot", type: "Search Crawler", value: "66.249.66.1", date: "Added 2 days ago" },
                  { name: "Partner API", type: "Server IP", value: "192.168.1.100", date: "Added 1 week ago" },
                  { name: "Internal QA", type: "Subnet", value: "10.0.0.0/24", date: "Added Oct 24" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800 rounded-md">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-zinc-800 rounded">
                        <Bot className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-zinc-500">{item.type} • {item.value}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">{item.date}</span>
                      <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}