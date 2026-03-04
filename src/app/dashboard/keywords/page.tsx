"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { KeywordManager } from "@/components/dashboard/KeywordManager"

export default function KeywordsPage() {
  return (
    <>
      <DashboardHeader />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-8">

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Keyword Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the keywords CynoGuard monitors across social platforms.
              Keywords control what the monitoring engine scans and analyzes.
            </p>
          </div>

          {/* Main component */}
          <KeywordManager />

        </div>
      </main>
    </>
  )
}