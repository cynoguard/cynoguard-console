"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Shield, Settings, List, Star, BarChart3 } from "lucide-react"
import { CustomRules } from "@/components/dashboard/bots/rules/custom-rules"
import { WhitelistManagement } from "@/components/dashboard/bots/rules/whitelist-management"
import { RuleTemplates } from "@/components/dashboard/bots/rules/rule-templates"
import { RuleAnalytics } from "@/components/dashboard/bots/rules/rule-analytics"

export default function BotRulesPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bot Rules & Whitelist</h1>
          <p className="text-muted-foreground">
            Manage custom detection rules, whitelists, and analyze rule performance
          </p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <Shield className="w-3 h-3 mr-1" />
          12 Active Rules
        </Badge>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Custom Rules
          </TabsTrigger>
          <TabsTrigger value="whitelist" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Whitelist
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          <CustomRules />
        </TabsContent>

        <TabsContent value="whitelist" className="space-y-6">
          <WhitelistManagement />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <RuleTemplates />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RuleAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}