/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ChartAreaInteractive } from "@/components/charts/area-chart-interactive";
import { ChartPieDonutText } from "@/components/charts/pie-chart-donut-text";
import KpiCard from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchApiKeyMetrics, type OverviewRange } from "@/lib/api/bot-management";
import {
    Activity,
    ArrowLeft,
    Bot,
    CheckCircle,
    Clock,
    Gauge,
    Globe,
    Monitor,
    RefreshCw,
    ShieldAlert,
    Smartphone, Tablet,
    TrendingDown,
    TrendingUp,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────
type KpiSet = {
  totalRequests:      { value: number; delta: number };
  botsBlocked:        { value: number; delta: number };
  humanPassRate:      { value: number; delta: number };
  avgRiskScore:       { value: number; delta: number };
  activeSessions:     { value: number; delta: number };
  avgTimeToSolve:     { value: number; delta: number };
  challengeSolveRate: { value: number; delta: number };
};

type BreakdownItem  = { action: string; count: number };
type DeviceItem     = { device: string; count: number };
type RiskItem       = { risk: string; count: number };
type IpItem         = { ip: string; count: number };
type CountryItem    = { country: string; count: number };
type ChartRow       = { date: string; action: string; count: number };

type ApiKeyData = {
  apiKey: {
    id: string; name: string; status: string;
    lastUsedAt: string | null; createdAt: string;
    rule: { strictness: string; persistence: number } | null;
  };
  kpis:            KpiSet;
  chart:           ChartRow[];
  actionBreakdown: BreakdownItem[];
  deviceBreakdown: DeviceItem[];
  riskBreakdown:   RiskItem[];
  topIps:          IpItem[];
  topCountries:    CountryItem[];
};

// ── Helpers ────────────────────────────────────────────
const transformChartData = (raw: ChartRow[]) => {
  // TODO: type safety - temporary any for build stability
  const map: Record<string, any> = {};
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
const transformPieData = (raw: BreakdownItem[]) =>
  raw.map(({ action, count }) => ({
    name:  action.charAt(0).toUpperCase() + action.slice(1),
    value: count,
    fill:  PIE_COLORS[action] ?? "hsl(220,10%,50%)",
  }));

const DEVICE_COLORS: Record<string, string> = {
  DESKTOP: "hsl(217, 91%, 60%)",
  MOBILE:  "hsl(142, 70%, 45%)",
  TABLET:  "hsl(45, 90%, 55%)",
  BOT:     "hsl(0, 70%, 55%)",
  UNKNOWN: "hsl(220, 10%, 45%)",
};
const DEVICE_ICONS: Record<string, React.ReactNode> = {
  DESKTOP: <Monitor className="h-3.5 w-3.5" />,
  MOBILE:  <Smartphone className="h-3.5 w-3.5" />,
  TABLET:  <Tablet className="h-3.5 w-3.5" />,
  BOT:     <Bot className="h-3.5 w-3.5" />,
  UNKNOWN: <Globe className="h-3.5 w-3.5" />,
};

const RISK_COLORS: Record<string, string> = {
  LOW:    "hsl(142, 70%, 45%)",
  MEDIUM: "hsl(45, 90%, 55%)",
  HIGH:   "hsl(0, 70%, 55%)",
};

const RANGES: { label: string; value: OverviewRange }[] = [
  { label: "24H", value: "24h" },
  { label: "7D",  value: "7d"  },
  { label: "30D", value: "30d" },
];

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

// ── Bar row for breakdown lists ────────────────────────
const BarRow = ({
  label, count, total, color, icon,
}: { label: string; count: number; total: number; color: string; icon?: React.ReactNode }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 text-zinc-400">
          {icon && <span style={{ color }}>{icon}</span>}
          {label}
        </span>
        <span className="tabular-nums text-zinc-300 font-medium">
          {count.toLocaleString()}
          <span className="text-zinc-600 ml-1.5">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────
export default function ApiKeyMetricsPage() {
  const params  = useParams();
  const org     = params?.org    as string;
  const project = params?.project as string;
  const keyId   = params?.keyId  as string;

  const [data,    setData]    = useState<ApiKeyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [range,   setRange]   = useState<OverviewRange>("7d");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchApiKeyMetrics(keyId, range);
      setData(result);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to load API key metrics.");
    } finally {
      setLoading(false);
    }
  }, [keyId, range]);

  useEffect(() => { load(); }, [load]);

  const kpis      = data?.kpis;
  const chartData = data ? transformChartData(data.chart) : [];
  const pieData   = data ? transformPieData(data.actionBreakdown) : [];

  const deviceTotal  = data?.deviceBreakdown.reduce((s, d) => s + d.count, 0) ?? 0;
  const riskTotal    = data?.riskBreakdown.reduce((s, d) => s + d.count, 0) ?? 0;
  const countryTotal = data?.topCountries.reduce((s, d) => s + d.count, 0) ?? 0;
  const ipTotal      = data?.topIps.reduce((s, d) => s + d.count, 0) ?? 0;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col py-10 px-4 sm:px-6 lg:px-8 space-y-10">

      {/* Back */}
      <Link
        href={`/${org}/${project}/bots/overview`}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Overview
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {loading ? (
                <span className="inline-block h-8 w-48 bg-zinc-800 rounded animate-pulse" />
              ) : data?.apiKey.name}
            </h1>
            {!loading && data?.apiKey.rule && (
              <StrictnessBadge mode={data.apiKey.rule.strictness} />
            )}
            {!loading && (
              <Badge
                variant="outline"
                className={
                  data?.apiKey.status === "active"
                    ? "border-green-500/40 text-green-400 bg-green-500/5"
                    : "border-zinc-700 text-zinc-500"
                }
              >
                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${
                  data?.apiKey.status === "active" ? "bg-green-400 animate-pulse" : "bg-zinc-500"
                }`} />
                {data?.apiKey.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
              {keyId}
            </span>
            {data?.apiKey.rule && (
              <span>{data.apiKey.rule.persistence}h persistence</span>
            )}
            {data?.apiKey.lastUsedAt && (
              <span>
                Last active{" "}
                {new Date(data.apiKey.lastUsedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            )}
          </div>
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

      {/* KPI Row 1 — 4 cards */}
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
              description="All detections in period"
              trend={<DeltaBadge delta={kpis?.totalRequests.delta ?? 0} />}
              tooltip="Total bot detection calls attributed to this API key's project in the selected time range."
            />
            <KpiCard
              accent="red"
              icon={<ShieldAlert className="h-4 w-4" />}
              title="Bots Blocked"
              value={kpis?.botsBlocked.value.toLocaleString() ?? "0"}
              description="Challenge + uncertain"
              trend={<DeltaBadge delta={kpis?.botsBlocked.delta ?? 0} />}
              tooltip="Requests where bot detection issued a challenge or flagged the session as uncertain."
            />
            <KpiCard
              accent="green"
              icon={<Users className="h-4 w-4" />}
              title="Human Pass Rate"
              value={`${kpis?.humanPassRate.value ?? 0}%`}
              description="Allowed without challenge"
              trend={
                <span className={`text-xs font-semibold ${
                  (kpis?.humanPassRate.value ?? 0) > 70 ? "text-green-400" : "text-yellow-400"
                }`}>
                  {(kpis?.humanPassRate.value ?? 0) > 70 ? "Healthy" : "Review recommended"}
                </span>
              }
              tooltip="Percentage of sessions that passed as human without requiring a challenge. High values indicate low bot traffic."
            />
            <KpiCard
              accent="yellow"
              icon={<Gauge className="h-4 w-4" />}
              title="Avg. Risk Score"
              value={`${kpis?.avgRiskScore.value ?? 0}`}
              description={
                (kpis?.avgRiskScore.value ?? 0) < 40 ? "Low threat"
                : (kpis?.avgRiskScore.value ?? 0) < 70 ? "Moderate threat"
                : "High threat"
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
              tooltip="Average heuristic score across all detections. 0–29 = bot, 30–70 = uncertain, 71–100 = human."
            />
          </>
        )}
      </div>

      {/* KPI Row 2 — 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <><KpiSkeleton /><KpiSkeleton /><KpiSkeleton /></>
        ) : (
          <>
            <KpiCard
              accent="blue"
              icon={<Bot className="h-4 w-4" />}
              title="Active Sessions"
              value={kpis?.activeSessions.value.toLocaleString() ?? "0"}
              description="Unique session IDs — last 24h"
              trend={<span className="text-xs text-zinc-500">rolling window</span>}
              tooltip="Unique visitor sessions seen in the last 24 hours. Always reflects last 24h regardless of range."
            />
            <KpiCard
              accent="default"
              icon={<Clock className="h-4 w-4" />}
              title="Avg. Solve Time"
              value={
                (kpis?.avgTimeToSolve.value ?? 0) > 0
                  ? `${((kpis?.avgTimeToSolve.value ?? 0) / 1000).toFixed(1)}s`
                  : "N/A"
              }
              description="Time to complete challenge"
              trend={
                (kpis?.avgTimeToSolve.value ?? 0) > 0
                  ? <span className={`text-xs font-semibold ${
                      (kpis?.avgTimeToSolve.value ?? 0) < 5000 ? "text-green-400" : "text-yellow-400"
                    }`}>
                      {(kpis?.avgTimeToSolve.value ?? 0) < 5000 ? "Fast response" : "Slow response"}
                    </span>
                  : <span className="text-xs text-zinc-600">No challenges yet</span>
              }
              tooltip="Average time in seconds for visitors to complete the verification challenge. Humans typically solve in 2–8 seconds."
            />
            <KpiCard
              accent="green"
              icon={<CheckCircle className="h-4 w-4" />}
              title="Challenge Solve Rate"
              value={`${kpis?.challengeSolveRate.value ?? 0}%`}
              description="Of challenged sessions verified"
              trend={
                <span className={`text-xs font-semibold ${
                  (kpis?.challengeSolveRate.value ?? 0) > 60 ? "text-green-400" : "text-red-400"
                }`}>
                  {(kpis?.challengeSolveRate.value ?? 0) > 60 ? "Good solve rate" : "Low solve rate"}
                </span>
              }
              tooltip="Percentage of issued challenges that were successfully solved. Low rates suggest bot traffic that cannot pass verification."
            />
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-7">
        <div className="col-span-4">
          <ChartAreaInteractive
            data={chartData} loading={loading}
            dataKeys={["allow", "challenge", "uncertain"]}
            colors={{ allow: "hsl(142, 70%, 45%)", challenge: "hsl(0, 70%, 55%)", uncertain: "hsl(45, 90%, 55%)" }}
            title="Traffic Over Time"
            description="Detection actions day by day"
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

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Device Breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Device Types</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Visitor device breakdown</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.deviceBreakdown.map((d) => (
                <BarRow
                  key={d.device}
                  label={d.device}
                  count={d.count}
                  total={deviceTotal}
                  color={DEVICE_COLORS[d.device] ?? "#888"}
                  icon={DEVICE_ICONS[d.device]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Risk Breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Risk Levels</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Score distribution</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.riskBreakdown.map((r) => (
                <BarRow
                  key={r.risk}
                  label={r.risk}
                  count={r.count}
                  total={riskTotal}
                  color={RISK_COLORS[r.risk] ?? "#888"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Top Countries */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Top Countries</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Traffic by origin</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.topCountries.map((c) => (
                <BarRow
                  key={c.country}
                  label={c.country}
                  count={c.count}
                  total={countryTotal}
                  color="hsl(217, 91%, 60%)"
                />
              ))}
            </div>
          )}
        </div>

        {/* Top IPs */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">Top IPs</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Highest request volume</p>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.topIps.map((ip) => (
                <BarRow
                  key={ip.ip}
                  label={ip.ip}
                  count={ip.count}
                  total={ipTotal}
                  color="hsl(0, 70%, 55%)"
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}