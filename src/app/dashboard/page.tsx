"use client"

import { useCallback, useEffect, useState } from "react"
import type { DashboardData } from "@/lib/types/social-alert"
import { KpiCards } from "@/components/dashboard/KpiCards"
import { SentimentChart } from "@/components/dashboard/SentimentChart"
import { MentionsChart } from "@/components/dashboard/MentionsChart"
import { PlatformChart } from "@/components/dashboard/PlatformChart"
import { MentionsTable } from "@/components/dashboard/MentionsTable"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/social-alerts", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed")
      const json: DashboardData = await res.json()
      setData(json)
    } catch {
      // error handled by individual component skeletons
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Social Monitoring Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Brand performance analytics, sentiment trends, and recent mentions.
          </p>
        </div>

        {/* KPI cards */}
        <div className="mb-8">
          <KpiCards data={data} loading={loading} />
        </div>

        {/* Charts row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SentimentChart data={data} loading={loading} />
          <div className="lg:col-span-2">
            <MentionsChart data={data} loading={loading} />
          </div>
        </div>

        {/* Platform + table */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <PlatformChart data={data} loading={loading} />
          <div className="lg:col-span-2">
            <MentionsTable
              mentions={data?.recentMentions ?? []}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </main>
  )
}