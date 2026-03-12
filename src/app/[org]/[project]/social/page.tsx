'use client';

import { useEffect, useState } from 'react';
import { SentimentChart } from '@/components/dashboard/sentiment-chart';
import { MentionsChart } from '@/components/dashboard/mentions-chart';
import { ThreatFeed } from '@/components/dashboard/threat-feed';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import {
  fetchStats,
  fetchMentions,
  statsToDashboardData,
  mentionToAlert,
  type StatsResponse,
} from '@/services/api/social-monitoring';
import type { DashboardData, SocialAlert } from '@/lib/types/social-alert';

export default function SocialPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<SocialAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch stats + recent mentions in parallel
        const [stats, mentionsRes] = await Promise.all([
          fetchStats(),
          fetchMentions({ limit: 10 }),
        ]);

        const data = statsToDashboardData(stats);
        const recentAlerts = mentionsRes.data.map(mentionToAlert);

        setDashboardData({ ...data, recentMentions: recentAlerts });
        setAlerts(recentAlerts);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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
        <KpiCards data={dashboardData} loading={loading} />

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SentimentChart data={dashboardData} loading={loading} />
          <MentionsChart data={dashboardData} loading={loading} />
        </div>

        {/* Threat Feed */}
        <ThreatFeed alerts={alerts} loading={loading} />

      </div>
    </div>
  );
}