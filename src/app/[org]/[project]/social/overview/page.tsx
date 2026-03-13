"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectDashboard, type ProjectDashboard } from "@/lib/api/dashboard";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2, Clock,
  Globe,
  Key,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from "recharts";

function StatCard({
  icon, title, value, sub, accent = "default",
}: {
  icon: React.ReactNode; title: string; value: string | number;
  sub?: string; accent?: "default" | "red" | "yellow" | "blue" | "green";
}) {
  const colors = {
    default: "bg-zinc-800/60 text-zinc-400",
    red:     "bg-red-500/10   text-red-400",
    yellow:  "bg-yellow-500/10 text-yellow-400",
    blue:    "bg-blue-500/10  text-blue-400",
    green:   "bg-green-500/10 text-green-400",
  };
  return (
    <Card className="p-5 space-y-4 bg-zinc-900/50 border-zinc-800">
      <div className={`p-2 rounded-lg w-fit ${colors[accent]}`}>{icon}</div>
      <div>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </div>
    </Card>
  );
}

const riskStyles: Record<string, string> = {
  LOW:    "border-green-500/40  text-green-400",
  MEDIUM: "border-yellow-500/40 text-yellow-400",
  HIGH:   "border-orange-500/40 text-orange-400",
};

export default function ProjectOverviewPage() {
  const [data,    setData]    = useState<ProjectDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projectId = localStorage.getItem("activeProjectId");
    if (!projectId) return;
    getProjectDashboard(projectId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = data?.detectionChart.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  })) ?? [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Overview</h1>
        <p className="text-muted-foreground mt-1">
          Unified view of bot detection and social monitoring for this project.
        </p>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Activity     className="h-4 w-4" />} title="Total Detections" value={data?.totalDetections ?? 0}  sub="all time"                                     accent="default" />
          <StatCard icon={<Bot          className="h-4 w-4" />} title="Bots Detected"    value={data?.botDetections   ?? 0}  sub={`${data?.botRate ?? 0}% bot rate`}            accent="red"     />
          <StatCard icon={<CheckCircle2 className="h-4 w-4" />} title="Human Sessions"   value={data?.humanDetections ?? 0}  sub="allowed through"                              accent="green"   />
          <StatCard icon={<Clock        className="h-4 w-4" />} title="Last 24h"         value={data?.detections24h   ?? 0}  sub="detection events"                             accent="blue"    />
          <StatCard icon={<Globe        className="h-4 w-4" />} title="Brand Mentions"   value={data?.totalMentions   ?? 0}  sub="social monitoring"                            accent="blue"    />
          <StatCard icon={<ShieldAlert  className="h-4 w-4" />} title="High Risk"        value={data?.highRiskMentions?? 0}  sub="flagged mentions"                             accent="red"     />
          <StatCard icon={<AlertTriangle className="h-4 w-4"/>} title="Unreviewed"       value={data?.newMentions     ?? 0}  sub="new mentions"                                 accent="yellow"  />
          <StatCard icon={<Key          className="h-4 w-4" />} title="API Keys"         value={`${data?.activeApiKeys ?? 0}/${data?.totalApiKeys ?? 0}`} sub="active / total"  accent="default" />
        </div>
      )}

      {/* Detection Chart + Mentions by Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 7-day chart */}
        <Card className="lg:col-span-2 p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-sm font-semibold mb-1">Detections — Last 7 Days</h2>
          <p className="text-xs text-zinc-500 mb-4">Bot vs human traffic trend</p>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="bots"   x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(0,70%,55%)"   stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(0,70%,55%)"   stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="humans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(142,70%,45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142,70%,45%)" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="bots"   stroke="hsl(0,70%,55%)"   fill="url(#bots)"   strokeWidth={2} name="Bots"   />
                <Area type="monotone" dataKey="humans" stroke="hsl(142,70%,45%)" fill="url(#humans)" strokeWidth={2} name="Humans" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Mentions by Risk */}
        <Card className="p-6 bg-zinc-900/50 border-zinc-800">
          <h2 className="text-sm font-semibold mb-1">Mentions by Risk</h2>
          <p className="text-xs text-zinc-500 mb-4">All-time distribution</p>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {(data?.mentionsByRisk ?? []).map((r) => (
                <div key={r.riskLevel} className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3">
                  <Badge variant="outline" className={riskStyles[r.riskLevel] ?? ""}>
                    {r.riskLevel}
                  </Badge>
                  <span className="text-sm font-semibold tabular-nums">{r.count.toLocaleString()}</span>
                </div>
              ))}
              {!data?.mentionsByRisk.length && (
                <p className="text-xs text-zinc-500 text-center py-4">No mentions yet</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Detections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Recent Detections</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {loading ? (
            <div className="space-y-px">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 animate-pulse bg-zinc-900/30 border-b border-zinc-800 last:border-0" />
              ))}
            </div>
          ) : !data?.recentDetections.length ? (
            <div className="p-12 text-center text-sm text-zinc-500">No detections yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-zinc-800 bg-zinc-900/80">
                <tr>
                  {["IP Address", "Risk", "Action", "Type", "Time"].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {data.recentDetections.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono text-zinc-300">{d.ipAddress}</td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={riskStyles[d.riskLevel] ?? ""}>
                        {d.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm capitalize text-zinc-400">{d.action}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="outline"
                        className={d.isHuman
                          ? "border-green-500/40 text-green-400"
                          : "border-red-500/40 text-red-400"}
                      >
                        {d.isHuman ? "Human" : "Bot"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {new Date(d.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}