"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrgDashboard, type OrgDashboard } from "@/lib/api/dashboard";
import {
    Activity,
    Bot, Globe, Key, Projector,
    ShieldAlert, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function StatCard({
  icon, title, value, sub, accent = "default",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  sub?: string;
  accent?: "default" | "red" | "yellow" | "blue" | "green";
}) {
  const colors = {
    default: "bg-zinc-800/60 text-zinc-400",
    red:     "bg-red-500/10 text-red-400",
    yellow:  "bg-yellow-500/10 text-yellow-400",
    blue:    "bg-blue-500/10 text-blue-400",
    green:   "bg-green-500/10 text-green-400",
  };
  return (
    <Card className="p-5 space-y-4 bg-zinc-900/50 border-zinc-800">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${colors[accent]}`}>{icon}</div>
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </div>
    </Card>
  );
}

export default function OrgOverviewPage() {
  const {org} = useParams<{ org: string; }>();

  const [data,    setData]    = useState<OrgDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orgId = localStorage.getItem("organizationId");
    if (!orgId) return;
    getOrgDashboard(orgId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const riskColors: Record<string, string> = {
    LOW:    "border-green-500/40 text-green-400",
    MEDIUM: "border-yellow-500/40 text-yellow-400",
    HIGH:   "border-orange-500/40 text-orange-400",
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight capitalize">{org} — Overview</h1>
        <p className="text-muted-foreground mt-1">
          Organisation-wide summary across all projects.
        </p>
      </div>

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Projector className="h-4 w-4" />}   title="Total Projects"   value={data?.totalProjects   ?? 0} sub={`${data?.activeProjects ?? 0} active`}          accent="blue"    />
          <StatCard icon={<Activity   className="h-4 w-4" />}  title="Total Detections" value={data?.totalDetections ?? 0} sub="all time across projects"                         accent="default" />
          <StatCard icon={<Bot        className="h-4 w-4" />}  title="Bots Detected"    value={data?.totalBots       ?? 0} sub="non-human sessions"                              accent="red"     />
          <StatCard icon={<Key        className="h-4 w-4" />}  title="API Keys"         value={data?.totalApiKeys    ?? 0} sub="across all projects"                             accent="default" />
          <StatCard icon={<Globe      className="h-4 w-4" />}  title="Brand Mentions"   value={data?.totalMentions   ?? 0} sub="social monitoring"                               accent="blue"    />
          <StatCard icon={<ShieldAlert className="h-4 w-4"/>}  title="High Risk"        value={data?.highRiskMentions?? 0} sub="mentions flagged HIGH"                           accent="red"     />
          <StatCard icon={<TrendingUp className="h-4 w-4" />}  title="Active Projects"  value={data?.activeProjects  ?? 0} sub={`of ${data?.totalProjects ?? 0} total`}          accent="green"   />
        </div>
      )}

      {/* Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Projects</h2>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
            {data?.projects.length ?? 0} projects
          </Badge>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {loading ? (
            <div className="space-y-px">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-900/30 animate-pulse border-b border-zinc-800 last:border-0" />
              ))}
            </div>
          ) : !data?.projects.length ? (
            <div className="p-12 text-center text-zinc-500 text-sm">No projects found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-800 bg-zinc-900/80">
                  <tr>
                    {["Project", "Status", "Detections (7d)", "Mentions", "Created", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {data.projects.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-zinc-200">{p.name}</p>
                        <p className="text-[10px] text-zinc-600 font-mono">{p.id.slice(0, 16)}…</p>
                      </td>
                      <td className="px-5 py-4">
                        <Badge
                          variant="outline"
                          className={p.status === "active"
                            ? "border-green-500/40 text-green-400 bg-green-500/5"
                            : "border-zinc-700 text-zinc-500"}
                        >
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${p.status === "active" ? "bg-green-400" : "bg-zinc-500"}`} />
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-sm tabular-nums text-zinc-300">{p.detections7d.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm tabular-nums text-zinc-300">{p.mentions.toLocaleString()}</td>
                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/${org}/${p.name}/overview`}
                          className="text-xs text-zinc-500 hover:text-zinc-200 transition-colors flex items-center gap-1"
                        >
                          View <TrendingUp className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}