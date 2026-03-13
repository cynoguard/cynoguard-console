'use client';

import { KpiCards } from '@/components/dashboard/kpi-cards';
import { MentionsChart } from '@/components/dashboard/mentions-chart';
import { SentimentChart } from '@/components/dashboard/sentiment-chart';
import {
  DashboardData,
  fetchMentions,
  fetchStats,
  statsToDashboardData,
} from '@/services/api/social-monitoring';
import { useEffect, useState } from 'react';

export default function SocialPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stats] = await Promise.all([
          fetchStats(),
          fetchMentions({ limit: 10 }),
        ]);
        setDashboardData(statsToDashboardData(stats));
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
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Social Signals Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Monitor brand mentions, sentiment trends, and suspicious activity across social platforms.
          </p>
        </div>
        <KpiCards data={dashboardData} loading={loading} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SentimentChart data={dashboardData} loading={loading} />
          <MentionsChart data={dashboardData} loading={loading} />
        </div>
      </div>
    </div>
  );
}