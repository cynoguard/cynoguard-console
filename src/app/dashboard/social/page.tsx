'use client';

import { SentimentChart } from '@/components/dashboard/sentiment-chart';
import { MentionsChart } from '@/components/dashboard/mentions-chart';
import { ThreatFeed } from '@/components/dashboard/threat-feed';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { mockAlerts } from '@/lib/mock-data';

const mockDashboardData = {
  totalMentions: 2847,
  mentionsToday: 124,
  sentiment: {
    positive: 1245,
    neutral: 892,
    negative: 710,
  },
  platformDistribution: {
    X: 2847,
  },
  mentionsPerDay: [
    { date: 'Mon', mentions: 200 },
    { date: 'Tue', mentions: 300 },
    { date: 'Wed', mentions: 250 },
    { date: 'Thu', mentions: 450 },
    { date: 'Fri', mentions: 380 },
    { date: 'Sat', mentions: 420 },
    { date: 'Sun', mentions: 362 },
  ],
  recentMentions: mockAlerts.slice(0, 5),
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background px-6 py-6 lg:px-8">

      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Social Signals Monitoring
          </h1>

          <p className="text-sm text-muted-foreground">
            Monitor brand mentions, sentiment trends, and suspicious activity across social platforms.
          </p>
        </div>

        {/* KPI Cards */}
        <KpiCards
          data={mockDashboardData}
          loading={false}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <SentimentChart
            data={mockDashboardData}
            loading={false}
          />

          <MentionsChart
            data={mockDashboardData}
            loading={false}
          />

        </div>

        {/* Threat Feed */}
        <ThreatFeed alerts={mockAlerts} />

      </div>

    </div>
  );
}