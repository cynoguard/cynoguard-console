'use client';

import { KpiCards } from '@/components/dashboard/kpi-cards';
import { MentionsChart } from '@/components/dashboard/mentions-chart';
import { SentimentChart } from '@/components/dashboard/sentiment-chart';
import { getMentionStats, statsToDashboardData, type MentionStats } from '@/services/api/social-monitoring';
import { Button } from '@/components/ui/button';
import { RefreshCw, Radio } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { DashboardData } from '@/lib/types/social-alert';

// Converts the API MentionStats into the DashboardData shape the components expect
function mapStats(stats: MentionStats): DashboardData {
  const positive = stats.bySentiment.find(s => s.sentiment === 'POSITIVE')?._count ?? 0;
  const negative = stats.bySentiment.find(s => s.sentiment === 'NEGATIVE')?._count ?? 0;
  const neutral  = stats.bySentiment.find(s => s.sentiment === 'NEUTRAL')?._count ?? 0;
  const total    = stats.byStatus.reduce((s, r) => s + r._count, 0);

  return {
    totalMentions:  total,
    mentionsToday:  stats.mentionsToday,
    sentiment: { positive, negative, neutral },
    platformDistribution: { X: total },
    mentionsPerDay: stats.mentionsOverTime.map(d => ({
      date:     new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mentions: d.count,
    })),
    recentMentions: [],
  };
}

export default function SocialOverviewPage() {
  const [data,      setData]      = useState<DashboardData | null>(null);
  const [rawStats,  setRawStats]  = useState<MentionStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    const projectId = localStorage.getItem('activeProjectId');
    if (!projectId) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const stats = await getMentionStats(projectId);
      setRawStats(stats);
      setData(mapStats(stats));
    } catch (err) {
      console.error('Failed to load social stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Build mentions-over-time data for the chart
  const chartData = rawStats?.mentionsOverTime.map(d => ({
    date:     new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    mentions: d.count,
  })) ?? [];

  // Last scan info
  const lastScan = rawStats?.recentScans?.[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Monitoring</h1>
          <p className="text-muted-foreground mt-1">
            Real-time brand mention tracking, risk scoring, and sentiment analysis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-lg px-3 py-2">
              <Radio className="h-3.5 w-3.5 text-green-500 animate-pulse" />
              Last scan: {new Date(lastScan.scannedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              &nbsp;·&nbsp;
              {lastScan.mentionsFound} found
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards data={data} loading={loading} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MentionsChart data={data} loading={loading} chartData={chartData} />
        </div>
        <div>
          <SentimentChart data={data} loading={loading} />
        </div>
      </div>

      {/* Risk breakdown */}
      {!loading && rawStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rawStats.byRisk.map((r) => {
            const styles: Record<string, string> = {
              LOW:      'border-green-500/30 bg-green-500/5 text-green-400',
              MEDIUM:   'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
              HIGH:     'border-orange-500/30 bg-orange-500/5 text-orange-400',
              CRITICAL: 'border-red-500/30 bg-red-500/5 text-red-400',
            };
            return (
              <div
                key={r.riskLevel}
                className={`rounded-xl border p-5 flex items-center justify-between ${styles[r.riskLevel] ?? 'border-border'}`}
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider opacity-70">{r.riskLevel} Risk</p>
                  <p className="text-3xl font-bold mt-1">{r._count.toLocaleString()}</p>
                </div>
                <div className="text-4xl opacity-20 font-black">
                  {r.riskLevel === 'LOW' ? '✓' : r.riskLevel === 'MEDIUM' ? '!' : '⚠'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent scans */}
      {!loading && rawStats?.recentScans && rawStats.recentScans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {['Status', 'Mentions Found', 'High Risk', 'Scanned At'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rawStats.recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${
                        scan.scanStatus === 'SUCCESS'
                          ? 'border-green-500/30 text-green-400 bg-green-500/5'
                          : 'border-red-500/30 text-red-400 bg-red-500/5'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${scan.scanStatus === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {scan.scanStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold">{scan.mentionsFound}</td>
                    <td className="px-5 py-3 text-sm text-orange-400">{scan.highRiskCount}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {new Date(scan.scannedAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}