/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChartAreaInteractive } from "@/components/charts/area-chart-interactive";
import { ChartPieDonutText } from "@/components/charts/pie-chart-donut-text";
import KpiCard from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchBotOverview, fetchProjectApiKeys, type OverviewRange } from "@/lib/api/bot-management";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Activity, Bot,
  ExternalLink,
  Gauge,
  Key,
  RefreshCw, ShieldAlert,
  TrendingDown, TrendingUp
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────
type KpiData = {
  totalRequests:  { value: number; delta: number };
  botsBlocked:    { value: number; delta: number };
  avgRiskScore:   { value: number; delta: number };
  activeSessions: { value: number; delta: number };
};
type ChartRow        = { date: string; action: string; count: number };
type ActionBreakdown = { action: string; count: number }[];
type OverviewData    = { kpis: KpiData; chart: ChartRow[]; actionBreakdown: ActionBreakdown };

type ApiKeyRow = {
  id:         string;
  name:       string;
  status:     string;
  lastUsedAt: string | null;
  createdAt:  string;
  rule: {
    strictness:  string;
    persistence: number;
  } | null;
};

// ── Transformers ───────────────────────────────────────
const transformChartData = (raw: ChartRow[]) => {
  const map: Record<string, Record<string, number>> = {};
  raw.forEach(({ date, action, count }) => {
    const d = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!map[d]) map[d] = { date: d, allow: 0, challenge: 0, uncertain: 0 };
    map[d][action] = count;
  });
  return Object.values(map);
};

const PIE_COLORS: Record<string, string> = {
  allow:     "hsl(142, 70%, 45%)",
  challenge: "hsl(0, 70%, 55%)",
  uncertain: "hsl(45, 90%, 55%)",
};
const transformPieData = (raw: ActionBreakdown) =>
  raw.map(({ action, count }) => ({
    name:  action.charAt(0).toUpperCase() + action.slice(1),
    value: count,
    fill:  PIE_COLORS[action] ?? "hsl(220,10%,50%)",
  }));

// ── Delta badge ────────────────────────────────────────
const DeltaBadge = ({ delta }: { delta: number }) => {
  if (delta === 0) return <span className="text-xs text-zinc-600">No change</span>;
  const up = delta > 0;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-green-400" : "text-red-400"}`}>
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(delta)}% vs prev period
    </span>
  );
};

const RANGES: { label: string; value: OverviewRange }[] = [
  { label: "24H", value: "24h" },
  { label: "7D",  value: "7d"  },
  { label: "30D", value: "30d" },
];

const StrictnessBadge = ({ mode }: { mode: string }) => {
  const map: Record<string, string> = {
    passive:    "border-zinc-700 text-zinc-400",
    balanced:   "border-blue-500/40 text-blue-400",
    aggressive: "border-red-500/40 text-red-400",
  };
  return (
    <Badge variant="outline" className={`text-[10px] uppercase tracking-widest ${map[mode] ?? map.balanced}`}>
      {mode}
    </Badge>
  );
};

const KpiSkeleton = () => (
  <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 animate-pulse space-y-4 h-[160px]">
    <div className="flex justify-between">
      <div className="h-8 w-8 bg-zinc-800 rounded-lg" />
      <div className="h-3.5 w-3.5 bg-zinc-800 rounded-full" />
    </div>
    <div className="space-y-1.5">
      <div className="h-2.5 w-20 bg-zinc-800 rounded" />
      <div className="h-8 w-24 bg-zinc-700 rounded" />
    </div>
    <div className="h-px w-full bg-zinc-800" />
    <div className="h-2.5 w-28 bg-zinc-800 rounded" />
  </div>
);

// ── Page ───────────────────────────────────────────────
const Page = () => {
  const params  = useParams();
  const org     = params?.org     as string;
  const project = params?.project as string;

  const [data,        setData]        = useState<OverviewData | null>(null);
  const [apiKeys,     setApiKeys]     = useState<ApiKeyRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [keysLoading, setKeysLoading] = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [range,       setRange]       = useState<OverviewRange>("7d");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchBotOverview(range);
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load overview data.");
    } finally {
      setLoading(false);
    }
  }, [range]);

  const loadKeys = useCallback(async () => {
    setKeysLoading(true);
    try {
      const result = await fetchProjectApiKeys();
      setApiKeys(result ?? []);
    } catch {
      setApiKeys([]);
    } finally {
      setKeysLoading(false);
    }
  }, []);

  useEffect(() => { load(); },     [load]);
  useEffect(() => { loadKeys(); }, [loadKeys]);

  const kpis      = data?.kpis;
  const chartData = data ? transformChartData(data.chart) : [];
  const pieData   = data ? transformPieData(data.actionBreakdown) : [];

  // ── TanStack table columns ─────────────────────────
  const columns: ColumnDef<ApiKeyRow>[] = [
    {
      accessorKey: "name",
      header: "API Key",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-md ${row.original.status === "active" ? "bg-green-500/10" : "bg-zinc-800"}`}>
            <Key className={`h-3.5 w-3.5 ${row.original.status === "active" ? "text-green-400" : "text-zinc-500"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">{row.getValue("name")}</p>
            <p className="text-[10px] text-zinc-600 font-mono">{row.original.id.slice(0, 16)}...</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant="outline"
            className={
              status === "active"
                ? "border-green-500/40 text-green-400 bg-green-500/5"
                : "border-zinc-700 text-zinc-500"
            }
          >
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${status === "active" ? "bg-green-400" : "bg-zinc-500"}`} />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "rule",
      header: "Strictness",
      cell: ({ row }) => {
        const rule = row.original.rule;
        return rule ? <StrictnessBadge mode={rule.strictness} /> : (
          <span className="text-xs text-zinc-600">Not configured</span>
        );
      },
    },
    {
      id: "persistence",
      header: "Persistence",
      cell: ({ row }) => (
        <span className="text-xs text-zinc-400 tabular-nums">
          {row.original.rule ? `${row.original.rule.persistence}h` : "—"}
        </span>
      ),
    },
    {
      accessorKey: "lastUsedAt",
      header: "Last Active",
      cell: ({ row }) => {
        const ts = row.getValue("lastUsedAt") as string | null;
        return (
          <span className="text-xs text-zinc-500">
            {ts
              ? new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : "Never"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-zinc-600">
          {new Date(row.getValue("createdAt")).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Link
          href={`/${org}/${project}/bots/overview/api-key/${row.original.id}`}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors group"
        >
          <span className="hidden md:inline">View Metrics</span>
          <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      ),
    },
  ];

  const table = useReactTable({
    data:            apiKeys,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col py-10 px-4 sm:px-6 lg:px-8 space-y-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bot Overview</h1>
          <p className="text-muted-foreground mt-1">
            Project-level detection metrics across all active API keys.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  range === r.value ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg border border-red-500/30 bg-red-500/5 text-red-400 text-sm">{error}</div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></>
        ) : (
          <>
            <KpiCard
              accent="default"
              icon={<Activity className="h-4 w-4" />}
              title="Total Requests"
              value={kpis?.totalRequests.value.toLocaleString() ?? "0"}
              description="All detection calls in period"
              trend={<DeltaBadge delta={kpis?.totalRequests.delta ?? 0} />}
              tooltip="Total number of bot detection API calls made across all API keys in this project during the selected time range."
            />
            <KpiCard
              accent="red"
              icon={<ShieldAlert className="h-4 w-4" />}
              title="Bots Blocked"
              value={kpis?.botsBlocked.value.toLocaleString() ?? "0"}
              description="Challenged + uncertain actions"
              trend={<DeltaBadge delta={kpis?.botsBlocked.delta ?? 0} />}
              tooltip="Requests where the bot detection engine issued a challenge or flagged the session as uncertain. Includes both challenge and uncertain action outcomes."
            />
            <KpiCard
              accent="yellow"
              icon={<Gauge className="h-4 w-4" />}
              title="Avg. Risk Score"
              value={`${kpis?.avgRiskScore.value ?? 0}`}
              description={
                (kpis?.avgRiskScore.value ?? 0) < 40 ? "Low threat environment"
                : (kpis?.avgRiskScore.value ?? 0) < 70 ? "Moderate threat level"
                : "High threat level"
              }
              trend={
                <span className={`text-xs font-semibold ${
                  (kpis?.avgRiskScore.value ?? 0) < 40 ? "text-green-400"
                  : (kpis?.avgRiskScore.value ?? 0) < 70 ? "text-yellow-400"
                  : "text-red-400"
                }`}>
                  out of 100
                </span>
              }
              tooltip="Average heuristic risk score across all detections. Score 0–29 = high risk bot, 30–70 = uncertain, 71–100 = likely human."
            />
            <KpiCard
              accent="blue"
              icon={<Bot className="h-4 w-4" />}
              title="Active Sessions"
              value={kpis?.activeSessions.value.toLocaleString() ?? "0"}
              description="Unique session IDs — last 24h"
              trend={<span className="text-xs text-zinc-500 font-medium">rolling window</span>}
              tooltip="Count of unique visitor session IDs seen in the last 24 hours across all API keys. Always reflects last 24h regardless of range selected above."
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-7">
        <div className="col-span-4">
          <ChartAreaInteractive
            data={chartData} loading={loading}
            dataKeys={["allow", "challenge", "uncertain"]}
            colors={{ allow: "hsl(142, 70%, 45%)", challenge: "hsl(0, 70%, 55%)", uncertain: "hsl(45, 90%, 55%)" }}
            title="Traffic Over Time"
            description="Bot vs human request distribution"
          />
        </div>
        <div className="col-span-3">
          <ChartPieDonutText
            data={pieData} loading={loading}
            title="Action Breakdown"
            description={`Detection outcomes — last ${range}`}
            centerLabel="Total"
            centerValue={pieData.reduce((s, d) => s + d.value, 0).toLocaleString()}
          />
        </div>
      </div>

      {/* API Keys Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">API Keys</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              All keys under this project. Click View Metrics for per-key analytics.
            </p>
          </div>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
            {apiKeys.length} {apiKeys.length === 1 ? "key" : "keys"}
          </Badge>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          {keysLoading ? (
            <div className="space-y-px">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-900/30 animate-pulse border-b border-zinc-800 last:border-0" />
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="p-12 text-center">
              <Key className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No API keys found for this project.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-800 bg-zinc-900/80">
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(header => (
                        <th key={header.id} className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-5 py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
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
};

export default Page;