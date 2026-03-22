"use client";

import {
  getMentionStats,
  triggerScan,
  type MentionStats,
} from "@/services/api/social-monitoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  Radio,
  Scan,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  Minus,
  TrendingUp,
  CalendarClock,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "default" | "blue" | "green" | "red" | "yellow" | "purple";
}) {
  const colors = {
    default: "bg-zinc-800/60 text-zinc-400",
    blue:    "bg-blue-500/10 text-blue-400",
    green:   "bg-green-500/10 text-green-400",
    red:     "bg-red-500/10 text-red-400",
    yellow:  "bg-yellow-500/10 text-yellow-400",
    purple:  "bg-purple-500/10 text-purple-400",
  };

  return (
    <Card className="p-5 bg-zinc-900/50 border-zinc-800 space-y-3">
      <div className={`w-fit p-2 rounded-lg ${colors[accent]}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-zinc-600 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SocialOverviewPage() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [stats,     setStats]     = useState<MentionStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [scanning,  setScanning]  = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Read projectId from localStorage (set by app-initializer on login/project switch)
  useEffect(() => {
    const id = localStorage.getItem("activeProjectId");
    setProjectId(id);
  }, []);

  // Load stats once projectId is known
  const load = useCallback(async (isRefresh = false) => {
    if (!projectId) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data = await getMentionStats(projectId);
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // Manual scan
  const handleScan = async () => {
    if (!projectId) return;
    setScanning(true);
    try {
      await triggerScan(projectId);
      await load(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  // Derived numbers
  const totalMentions  = stats?.byStatus.reduce((s, r) => s + r._count, 0) ?? 0;
  const highRiskCount  = stats?.byRisk.find((r) => r.riskLevel === "HIGH")?._count ?? 0;
  const newCount       = stats?.byStatus.find((r) => r.status === "NEW")?._count ?? 0;
  const positiveCount  = stats?.bySentiment.find((r) => r.sentiment === "POSITIVE")?._count ?? 0;
  const negativeCount  = stats?.bySentiment.find((r) => r.sentiment === "NEGATIVE")?._count ?? 0;
  const neutralCount   = stats?.bySentiment.find((r) => r.sentiment === "NEUTRAL")?._count ?? 0;
  const lastScan       = stats?.recentScans?.[0];

  const positivePct = totalMentions ? ((positiveCount / totalMentions) * 100).toFixed(1) : "0";
  const negativePct = totalMentions ? ((negativeCount / totalMentions) * 100).toFixed(1) : "0";

  // Chart data
  const chartData = stats?.mentionsOverTime.map((d) => ({
    date:  new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    count: d.count,
  })) ?? [];

  const pieData = [
    { name: "Positive", value: positiveCount, fill: "#22c55e" },
    { name: "Neutral",  value: neutralCount,  fill: "#71717a" },
    { name: "Negative", value: negativeCount, fill: "#ef4444" },
  ].filter((d) => d.value > 0);

  const riskStyles: Record<string, string> = {
    LOW:    "border-green-500/30 bg-green-500/5 text-green-400",
    MEDIUM: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
    HIGH:   "border-red-500/30 bg-red-500/5 text-red-400",
  };

  if (!projectId && !loading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500 text-sm">
        Could not resolve project. Please refresh.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Media Monitoring</h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Real-time brand mentions, risk scoring, and sentiment analysis.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {lastScan && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 border border-zinc-800 rounded-lg px-3 py-2">
              <Radio className="h-3.5 w-3.5 text-green-500 animate-pulse" />
              Last scan: {new Date(lastScan.scannedAt).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit",
              })}
              &nbsp;·&nbsp;{lastScan.mentionsFound} found
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(true)}
            disabled={refreshing || loading}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={handleScan}
            disabled={scanning || loading || !projectId}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            <Scan className={`h-4 w-4 mr-2 ${scanning ? "animate-spin" : ""}`} />
            {scanning ? "Scanning..." : "Scan Now"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-zinc-800/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard icon={<MessageSquare className="h-4 w-4" />} label="Total Mentions"   value={totalMentions.toLocaleString()}  sub="all time"                           accent="blue"    />
          <KpiCard icon={<CalendarClock  className="h-4 w-4" />} label="Mentions Today"  value={stats?.mentionsToday ?? 0}        sub="last 24 hours"                      accent="purple"  />
          <KpiCard icon={<ThumbsUp       className="h-4 w-4" />} label="Positive"        value={positiveCount.toLocaleString()}   sub={`${positivePct}% of total`}         accent="green"   />
          <KpiCard icon={<ThumbsDown     className="h-4 w-4" />} label="Negative"        value={negativeCount.toLocaleString()}   sub={`${negativePct}% of total`}         accent="red"     />
          <KpiCard icon={<AlertTriangle  className="h-4 w-4" />} label="Unreviewed"      value={newCount.toLocaleString()}        sub="new mentions"                       accent="yellow"  />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Mentions over time */}
        <Card className="lg:col-span-2 p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-sm font-semibold mb-1">Mentions Over Time</h2>
          <p className="text-xs text-zinc-500 mb-5">30-day rolling window</p>
          {loading ? (
            <Skeleton className="h-56 w-full rounded-lg bg-zinc-800/50" />
          ) : chartData.some((d) => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="mentionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} interval={4} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v, "Mentions"]}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#mentionGrad)" strokeWidth={2} name="Mentions" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-sm text-zinc-600">
              No mention data yet — add keywords and run a scan.
            </div>
          )}
        </Card>

        {/* Sentiment donut */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-sm font-semibold mb-1">Sentiment Distribution</h2>
          <p className="text-xs text-zinc-500 mb-4">All-time breakdown</p>
          {loading ? (
            <Skeleton className="h-48 w-full rounded-full bg-zinc-800/50" />
          ) : pieData.length > 0 ? (
            <div className="relative flex items-center justify-center h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [v, "mentions"]}
                  />
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} stroke="#09090b" strokeWidth={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold">{totalMentions}</span>
                <span className="text-xs text-zinc-500">total</span>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-zinc-600">No data</div>
          )}
          {pieData.length > 0 && (
            <div className="mt-4 space-y-2">
              {pieData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-zinc-400">{d.name}</span>
                  </div>
                  <span className="text-zinc-300 font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Risk breakdown */}
      {!loading && stats?.byRisk && stats.byRisk.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.byRisk.map((r) => (
            <div key={r.riskLevel} className={`rounded-xl border p-5 flex items-center justify-between ${riskStyles[r.riskLevel] ?? "border-zinc-800"}`}>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider opacity-70">{r.riskLevel} Risk</p>
                <p className="text-3xl font-bold mt-1">{r._count.toLocaleString()}</p>
              </div>
              <ShieldAlert className="h-8 w-8 opacity-20" />
            </div>
          ))}
        </div>
      )}

      {/* Recent scans */}
      {!loading && stats?.recentScans && stats.recentScans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Recent Scans</h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b border-zinc-800 bg-zinc-900/80">
                <tr>
                  {["Status", "Mentions Found", "High Risk", "Scanned At"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {stats.recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-zinc-800/20">
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={scan.scanStatus === "SUCCESS"
                          ? "border-green-500/30 text-green-400 bg-green-500/5"
                          : "border-red-500/30 text-red-400 bg-red-500/5"}
                      >
                        {scan.scanStatus}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold">{scan.mentionsFound}</td>
                    <td className="px-5 py-3 text-sm text-orange-400">{scan.highRiskCount}</td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {new Date(scan.scannedAt).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
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