/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sheet, SheetContent, SheetDescription,
    SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { fetchDetectionLogs, fetchGeoDistribution, type OverviewRange } from "@/lib/api/bot-management";
import { NUMERIC_TO_ALPHA2 } from "@/lib/iso-numeric-map";
import {
    ColumnDef, flexRender,
    getCoreRowModel, useReactTable,
} from "@tanstack/react-table";
import {
    Activity, Bot, ChevronLeft, ChevronRight,
    Cpu, ExternalLink, Fingerprint,
    Globe, Monitor, RefreshCw,
    Search, Shield, ShieldAlert,
    Smartphone, Tablet, Wifi, X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────
type DetectionLog = {
  id:              string;
  ipAddress:       string;
  countryCode:     string | null;
  city:            string | null;
  userAgent:       string;
  deviceType:      string;
  isHeadless:      boolean;
  score:           number;
  riskLevel:       string;
  action:          string;
  isHuman:         boolean;
  sessionId:       string | null;
  challengeCount:  number;
  challengeSolved: boolean;
  timeToSolve:     number;
  createdAt:       string;
  signals:         Record<string, any>;
};

type GeoRow = { country: string; count: number };

type PaginatedLogs = {
  rows:       DetectionLog[];
  total:      number;
  page:       number;
  totalPages: number;
};

// ── Constants ──────────────────────────────────────────
const RANGES: { label: string; value: OverviewRange }[] = [
  { label: "24H", value: "24h" },
  { label: "7D",  value: "7d"  },
  { label: "30D", value: "30d" },
];

const ACTION_FILTERS = ["all", "allow", "challenge", "uncertain"] as const;
const LIMIT = 10;

// ── Helpers ────────────────────────────────────────────
const actionStyle = (action: string) => {
  if (action === "low")     return "border-green-500/40 text-green-400 bg-green-500/5";
  if (action === "high") return "border-red-500/40 text-red-400 bg-red-500/5";
  return "border-yellow-500/40 text-yellow-400 bg-yellow-500/5";
};

const riskColor = (score: number) =>
  score > 70 ? "#22c55e" : score > 30 ? "#eab308" : "#ef4444";

const deviceIcon = (type: string) => {
  if (type === "MOBILE")  return <Smartphone className="h-3.5 w-3.5" />;
  if (type === "TABLET")  return <Tablet className="h-3.5 w-3.5" />;
  if (type === "BOT")     return <Bot className="h-3.5 w-3.5" />;
  return <Monitor className="h-3.5 w-3.5" />;
};

const formatMs = (ms: number) =>
  ms > 0 ? `${(ms / 1000).toFixed(1)}s` : "—";

// ── Detail row ─────────────────────────────────────────
const DetailRow = ({
  label, value, accent,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "red" | "green" | "yellow";
}) => (
  <div className="flex items-start justify-between py-2.5 border-b border-zinc-800/60 last:border-0">
    <span className="text-xs text-zinc-500 shrink-0 w-36">{label}</span>
    <span className={`text-xs font-medium text-right break-all ml-4 ${
      accent === "red"    ? "text-red-400"    :
      accent === "green"  ? "text-green-400"  :
      accent === "yellow" ? "text-yellow-400" :
      "text-zinc-200"
    }`}>
      {value}
    </span>
  </div>
);

// ── Skeleton rows ──────────────────────────────────────
const RowSkeleton = () => (
  <>
    {[1,2,3,4,5,6,7,8].map(i => (
      <tr key={i} className="border-b border-zinc-800/60">
        {[1,2,3,4,5,6,7].map(j => (
          <td key={j} className="px-5 py-4">
            <div
              className="h-3.5 bg-zinc-800 rounded animate-pulse"
              style={{ width: `${40 + (j * 13) % 40}%` }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// ── D3 World Map ───────────────────────────────────────
const GeoMap = ({
  data, loading, range,
}: {
  data: GeoRow[]; loading: boolean; range: OverviewRange;
}) => {
  const svgRef  = useRef<SVGSVGElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; text: string;
  } | null>(null);

  const countryMap = Object.fromEntries(data.map(d => [d.country, d.count]));
  const maxCount   = Math.max(...data.map(d => d.count), 1);

  const getFill = (alpha2: string) => {
    const count = countryMap[alpha2];
    if (!count) return "#18181b";
    const t = count / maxCount;
    const r = Math.round(150 + t * 105);
    const g = Math.round(28  - t * 18);
    const b = Math.round(28  - t * 18);
    return `rgb(${r},${g},${b})`;
  };

  useEffect(() => {
    if (loading || !svgRef.current || !wrapRef.current) return;

    const width  = wrapRef.current.clientWidth  || 800;
    const height = 280;

    Promise.all([
      import("d3-geo"),
      import("d3-selection"),
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then(r => r.json()),
      import("topojson-client"),
    ]).then(([d3Geo, d3Sel, world, topo]) => {
      const svg = d3Sel.select(svgRef.current!);
      svg.selectAll("*").remove();

      const projection = d3Geo.geoNaturalEarth1()
        .scale(width / 6.4)
        .translate([width / 2, height / 2]);

      const pathGen = d3Geo.geoPath().projection(projection);

      // 
      const countries = topo.feature(world, world.objects.countries) as any;

      svg
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", (d: any) => pathGen(d) ?? "")
        .attr("fill", (d: any) => {
          const alpha2 = NUMERIC_TO_ALPHA2[String(d.id)] ?? "";
          return getFill(alpha2);
        })
        .attr("stroke", "#27272a")
        .attr("stroke-width", 0.4)
        .style("cursor", "default")
        .style("transition", "fill 0.15s ease")
        .on("mouseover", function (event: MouseEvent, d: any) {
          const alpha2 = NUMERIC_TO_ALPHA2[String(d.id)] ?? "";
          const count  = countryMap[alpha2] ?? 0;
          const name   = d.properties?.name ?? alpha2 ?? "Unknown";

          // Highlight
          d3Sel.select(this as SVGPathElement)
            .attr("fill", count > 0 ? "#f87171" : "#2d2d30");

          // Tooltip position relative to svg wrapper
          const rect = wrapRef.current!.getBoundingClientRect();
          setTooltip({
            x:    event.clientX - rect.left,
            y:    event.clientY - rect.top - 42,
            text: count > 0
              ? `${name} — ${count.toLocaleString()} requests`
              : name,
          });
        })
        .on("mousemove", function (event: MouseEvent) {
          const rect = wrapRef.current!.getBoundingClientRect();
          setTooltip(prev =>
            prev
              ? { ...prev, x: event.clientX - rect.left, y: event.clientY - rect.top - 42 }
              : null
          );
        })
        .on("mouseout", function (_event: MouseEvent, d: any) {
          const alpha2 = NUMERIC_TO_ALPHA2[String(d.id)] ?? "";
          d3Sel.select(this as SVGPathElement).attr("fill", getFill(alpha2));
          setTooltip(null);
        });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, loading]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Globe className="h-4 w-4 text-zinc-400" />
            Geographic Origin
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Traffic source distribution — last {range}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-zinc-800 border border-zinc-700" />
            No traffic
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-6 rounded-sm"
              style={{ background: "linear-gradient(to right, #961e1e, #f82020)" }}
            />
            High volume
          </span>
        </div>
      </div>

      {/* Map area */}
      <div ref={wrapRef} className="relative w-full" style={{ height: 280 }}>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-900/80">
            <Globe className="h-8 w-8 text-zinc-700 animate-pulse mb-2" />
            <span className="text-xs text-zinc-600">Loading geo data...</span>
          </div>
        )}

        {/* SVG canvas */}
        <svg
          ref={svgRef}
          width="100%"
          height={280}
          style={{ display: "block" }}
        />

        {/* Hover tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-lg py-1.5 px-2.5 shadow-xl whitespace-nowrap"
            style={{
              left:      tooltip.x,
              top:       tooltip.y,
              transform: "translateX(-50%)",
            }}
          >
            {tooltip.text}
          </div>
        )}

        {/* Top origins overlay */}
        {!loading && data.length > 0 && (
          <div className="absolute bottom-3 right-4 bg-zinc-950/90 border border-zinc-800 rounded-lg p-3 min-w-[150px] space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Top Origins
            </p>
            {data.slice(0, 5).map((d, i) => (
              <div key={d.country} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-600 w-3 tabular-nums">{i + 1}</span>
                  <span className="text-[11px] font-mono font-medium text-zinc-300">
                    {d.country}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 tabular-nums">
                  {d.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page ───────────────────────────────────────────────
export default function LogsPage() {
  const [logs,         setLogs]         = useState<DetectionLog[]>([]);
  const [total,        setTotal]        = useState(0);
  const [totalPages,   setTotalPages]   = useState(1);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [geoData,      setGeoData]      = useState<GeoRow[]>([]);
  const [geoLoading,   setGeoLoading]   = useState(true);
  const [search,       setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [range,        setRange]        = useState<OverviewRange>("7d");
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // ── Data loaders ───────────────────────────────────
  const loadLogs = useCallback(async (
    p = 1,
    s = search,
    a = actionFilter,
  ) => {
    setLoading(true);
    try {
      const result: PaginatedLogs = await fetchDetectionLogs({
        page:   p,
        limit:  LIMIT,
        search: s,
        action: a === "all" ? "" : a,
      });
      setLogs(result.rows       ?? []);
      setTotal(result.total     ?? 0);
      setTotalPages(result.totalPages ?? 1);
      setPage(result.page       ?? 1);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter]);

  const loadGeo = useCallback(async () => {
    setGeoLoading(true);
    try {
      const result = await fetchGeoDistribution(range);
      setGeoData(result ?? []);
    } catch {
      setGeoData([]);
    } finally {
      setGeoLoading(false);
    }
  }, [range]);

  useEffect(() => { loadLogs(1); }, [actionFilter, loadLogs, range]);
  useEffect(() => { loadGeo();   }, [loadGeo]);

  const handleSearch = (val: string) => {
    setSearch(val);
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(
      () => loadLogs(1, val, actionFilter),
      400,
    );
  };

  // ── Columns ────────────────────────────────────────
  const columns: ColumnDef<DetectionLog>[] = [
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-zinc-500 whitespace-nowrap">
          {new Date(row.getValue("createdAt")).toLocaleString("en-US", {
            month: "short", day: "numeric",
            hour: "2-digit", minute: "2-digit", second: "2-digit",
          })}
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP Address",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Wifi className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
          <span className="font-mono text-xs text-zinc-300">
            {row.getValue("ipAddress")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "countryCode",
      header: "Origin",
      cell: ({ row }) => {
        const cc   = row.getValue("countryCode") as string | null;
        const city = row.original.city;
        return (
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
            <div>
              <span className="text-xs text-zinc-300 font-medium">{cc ?? "—"}</span>
              {city && (
                <span className="text-[10px] text-zinc-600 block">{city}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "deviceType",
      header: "Device",
      cell: ({ row }) => {
        const dt = row.getValue("deviceType") as string;
        return (
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
            {deviceIcon(dt)}
            <span className="capitalize">{dt.toLowerCase()}</span>
            {row.original.isHeadless && (
              <Badge
                variant="outline"
                className="text-[9px] border-orange-500/40 text-orange-400 py-0 px-1 ml-1"
              >
                HEADLESS
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: "Result",
      cell: ({ row }) => {
        const action = row.getValue("action") as string;
        return (
          <Badge
            variant="outline"
            className={`text-[10px] uppercase tracking-wider ${actionStyle(action)}`}
          >
            {action === "allow"
              ? <Shield className="h-2.5 w-2.5 mr-1" />
              : <ShieldAlert className="h-2.5 w-2.5 mr-1" />
            }
            {action}
          </Badge>
        );
      },
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => {
        const score = row.getValue("score") as number;
        return (
          <div className="flex items-center gap-2.5 min-w-[80px]">
            <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${score}%`, background: riskColor(score) }}
              />
            </div>
            <span
              className="text-xs tabular-nums"
              style={{ color: riskColor(score) }}
            >
              {score}
            </span>
          </div>
        );
      },
    },
    {
      id: "detail",
      header: "",
      cell: ({ row }) => {
        const r   = row.original;
        const sig = r.signals as any;
        return (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 gap-1.5 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Details</span>
              </Button>
            </SheetTrigger>

            <SheetContent className="p-4 bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-lg overflow-y-auto">
              <SheetHeader className="pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${actionStyle(r.action)}`}
                  >
                    {r.action.toUpperCase()}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-zinc-700 text-zinc-400"
                  >
                    {r.riskLevel}
                  </Badge>
                  {r.isHeadless && (
                    <Badge
                      variant="outline"
                      className="text-[9px] border-orange-500/40 text-orange-400"
                    >
                      HEADLESS
                    </Badge>
                  )}
                </div>
                <SheetTitle className="font-mono text-sm text-zinc-300">
                  {r.id}
                </SheetTitle>
                <SheetDescription className="text-zinc-600 text-xs">
                  {new Date(r.createdAt).toLocaleString("en-US", {
                    dateStyle: "full", timeStyle: "medium",
                  })}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-5">

                {/* Score bar */}
                <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      Risk Score
                    </span>
                    <span
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: riskColor(r.score) }}
                    >
                      {r.score}
                      <span className="text-sm text-zinc-600 ml-1">/100</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.score}%`, background: riskColor(r.score) }}
                    />
                  </div>
                </div>

                {/* Network */}
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Wifi className="h-3 w-3" /> Network
                    </span>
                  </div>
                  <div className="px-4 divide-y divide-zinc-800/50">
                    <DetailRow label="IP Address" value={r.ipAddress} />
                    <DetailRow label="Country"    value={r.countryCode ?? "Unknown"} />
                    <DetailRow label="City"       value={r.city ?? "Unknown"} />
                    <DetailRow
                      label="Session ID"
                      value={r.sessionId ? `${r.sessionId.slice(0, 20)}…` : "None"}
                    />
                  </div>
                </div>

                {/* Device */}
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Monitor className="h-3 w-3" /> Device
                    </span>
                  </div>
                  <div className="px-4 divide-y divide-zinc-800/50">
                    <DetailRow label="Device Type" value={r.deviceType} />
                    <DetailRow
                      label="Headless"
                      value={r.isHeadless ? "DETECTED" : "CLEAN"}
                      accent={r.isHeadless ? "red" : "green"}
                    />
                    <DetailRow
                      label="CPU Cores"
                      value={`${sig?.hardwareConcurrency ?? "—"} cores`}
                    />
                    <DetailRow
                      label="Device Memory"
                      value={sig?.mem ? `${sig.mem} GB` : "—"}
                    />
                  </div>
                </div>

                {/* Heuristics */}
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Fingerprint className="h-3 w-3" /> Heuristics
                    </span>
                  </div>
                  <div className="px-4 divide-y divide-zinc-800/50">
                    <DetailRow
                      label="Webdriver"
                      value={sig?.webdriver ? "DETECTED" : "CLEAN"}
                      accent={sig?.webdriver ? "red" : "green"}
                    />
                    <DetailRow
                      label="WebGL"
                      value={sig?.webgl ? "SUPPORTED" : "MISSING"}
                      accent={sig?.webgl ? "green" : "red"}
                    />
                    <DetailRow
                      label="Canvas"
                      value={sig?.canvas ? "SUPPORTED" : "MISSING"}
                      accent={sig?.canvas ? "green" : "red"}
                    />
                    <DetailRow label="Platform"  value={sig?.platform ?? "—"} />
                    <DetailRow
                      label="Languages"
                      value={(sig?.languages ?? []).slice(0, 3).join(", ") || "—"}
                    />
                  </div>
                </div>

                {/* Challenge — only if challenged */}
                {r.challengeCount > 0 && (
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <div className="px-4 py-2.5 bg-zinc-900/80 border-b border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Shield className="h-3 w-3" /> Challenge
                      </span>
                    </div>
                    <div className="px-4 divide-y divide-zinc-800/50">
                      <DetailRow label="Attempts" value={`${r.challengeCount}`} />
                      <DetailRow
                        label="Solved"
                        value={r.challengeSolved ? "YES" : "NO"}
                        accent={r.challengeSolved ? "green" : "red"}
                      />
                      <DetailRow
                        label="Time to Solve"
                        value={formatMs(r.timeToSolve)}
                      />
                    </div>
                  </div>
                )}

                {/* Raw UA */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Cpu className="h-3 w-3" /> User Agent
                  </p>
                  <pre className="p-3 bg-black rounded-lg border border-zinc-800 text-[10px] font-mono text-zinc-400 break-all whitespace-pre-wrap leading-relaxed">
                    {r.userAgent}
                  </pre>
                </div>

              </div>
            </SheetContent>
          </Sheet>
        );
      },
    },
  ];

  const table = useReactTable({
    data:            logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ── Render ─────────────────────────────────────────
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col py-10 px-4 sm:px-6 lg:px-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detection Logs</h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse inline-block" />
            {total.toLocaleString()} total detections — live project feed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 gap-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  range === r.value
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline" size="sm"
            className="bg-zinc-900 border-zinc-800"
            onClick={() => { loadLogs(page); loadGeo(); }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* World Map */}
      <GeoMap data={geoData} loading={geoLoading} range={range} />

      {/* Table card */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search IP or Detection ID..."
              className="pl-10 bg-zinc-950 border-zinc-800 text-sm h-9 rounded-lg"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => { setSearch(""); loadLogs(1, "", actionFilter); }}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action filter pills */}
          <div className="flex items-center gap-1.5">
            {ACTION_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setActionFilter(f); loadLogs(1, search, f); }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  actionFilter === f
                    ? f === "all"
                      ? "bg-zinc-700 border-zinc-600 text-white"
                      : f === "allow"
                      ? "bg-green-500/15 border-green-500/40 text-green-400"
                      : f === "challenge"
                      ? "bg-red-500/15 border-red-500/40 text-red-400"
                      : "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
                    : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
            <Activity className="h-3.5 w-3.5" />
            Page {page} of {totalPages}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-800 bg-zinc-900/80">
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-5 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <RowSkeleton />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <Shield className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">No detections found</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Try adjusting your filters or time range
                    </p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="hover:bg-zinc-800/20 transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-5 py-3.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of{" "}
              {total.toLocaleString()} results
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline" size="sm"
                className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800"
                onClick={() => { setPage(p => p - 1); loadLogs(page - 1); }}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <Button
                    key={p}
                    variant="outline" size="sm"
                    className={`h-8 w-8 p-0 text-xs border-zinc-800 ${
                      p === page
                        ? "bg-zinc-700 text-white border-zinc-600"
                        : "bg-zinc-900 text-zinc-400"
                    }`}
                    onClick={() => { setPage(p); loadLogs(p); }}
                    disabled={loading}
                  >
                    {p}
                  </Button>
                );
              })}

              <Button
                variant="outline" size="sm"
                className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800"
                onClick={() => { setPage(p => p + 1); loadLogs(page + 1); }}
                disabled={page >= totalPages || loading}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}