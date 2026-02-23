"use client";

import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import {
    Globe,
    Play,
    ChevronRight,
    Shield,
    Clock,
    CalendarClock,
    Timer,
    Loader2,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";

import { useWatchlistEntry, useToggleActive, useTriggerScan } from "@/hooks/use-domain-monitoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FindingsTab } from "./findings-tab";
import { AlertsTab } from "./alerts-tab";
import { ScansTab } from "./scans-tab";

// ── Loading State ───────────────────────────────────────────────────

function DetailSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
            </div>
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-4 space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-7 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
}

// ── Main Detail Component ───────────────────────────────────────────

interface DomainDetailProps {
    watchlistId: string;
}

export function DomainDetail({ watchlistId }: DomainDetailProps) {
    const { data: entry, isLoading, isError, refetch } = useWatchlistEntry(watchlistId);
    const toggleActive = useToggleActive(watchlistId);
    const triggerScan = useTriggerScan(watchlistId);

    const handleScanNow = () => {
        triggerScan.mutate(undefined, {
            onSuccess: () => toast.success("Scan started"),
            onError: () => toast.error("Failed to start scan"),
        });
    };

    const handleToggle = (checked: boolean) => {
        toggleActive.mutate(checked, {
            onSuccess: () =>
                toast.success(checked ? "Monitoring resumed" : "Monitoring paused"),
            onError: () => toast.error("Failed to update status"),
        });
    };

    if (isLoading) return <DetailSkeleton />;

    if (isError || !entry) {
        return (
            <Card className="border-destructive/50">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Domain not found</h3>
                    <p className="text-muted-foreground mb-4">
                        The watchlist entry could not be loaded.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => refetch()} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Retry
                        </Button>
                        <Button variant="ghost" asChild>
                            <Link href="/dashboard/domain-monitoring">Back to list</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Link
                    href="/dashboard/domain-monitoring"
                    className="hover:text-foreground transition-colors"
                >
                    Domain Monitoring
                </Link>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium truncate max-w-[200px]">
                    {entry.officialDomainNormalized}
                </span>
            </nav>

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Globe className="h-6 w-6 text-primary" />
                        {entry.officialDomainRaw}
                    </h1>
                    {entry.officialDomainRaw !== entry.officialDomainNormalized && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Normalized: {entry.officialDomainNormalized}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Switch
                            id="active-toggle"
                            checked={entry.active}
                            onCheckedChange={handleToggle}
                            disabled={toggleActive.isPending}
                            aria-label="Toggle monitoring"
                        />
                        <label htmlFor="active-toggle" className="text-sm cursor-pointer select-none">
                            {entry.active ? (
                                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
                                    Paused
                                </Badge>
                            )}
                        </label>
                    </div>
                    <Button
                        onClick={handleScanNow}
                        disabled={triggerScan.isPending || entry.lastScanStatus === "running"}
                        size="sm"
                        className="gap-1.5"
                    >
                        {triggerScan.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                        Scan now
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Shield className="h-4 w-4" />
                            Suspicious Found
                        </div>
                        <p className="text-2xl font-bold">
                            {entry.suspiciousCount ?? 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Clock className="h-4 w-4" />
                            Last Scan
                        </div>
                        <p className="text-lg font-semibold">
                            {entry.lastScanAt
                                ? formatDistanceToNow(new Date(entry.lastScanAt), { addSuffix: true })
                                : "Never"}
                        </p>
                        {entry.lastScanAt && (
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(entry.lastScanAt), "MMM d, HH:mm")}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <CalendarClock className="h-4 w-4" />
                            Next Run
                        </div>
                        <p className="text-lg font-semibold">
                            {entry.nextRunAt
                                ? formatDistanceToNow(new Date(entry.nextRunAt), { addSuffix: true })
                                : "—"}
                        </p>
                        {entry.nextRunAt && (
                            <p className="text-xs text-muted-foreground">
                                {format(new Date(entry.nextRunAt), "MMM d, HH:mm")}
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Timer className="h-4 w-4" />
                            Scan Interval
                        </div>
                        <p className="text-2xl font-bold">{entry.intervalHours}h</p>
                        <p className="text-xs text-muted-foreground">Between scans</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="findings" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="findings">Similar Domains</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="scans">Scan History</TabsTrigger>
                </TabsList>

                <TabsContent value="findings">
                    <FindingsTab watchlistId={watchlistId} />
                </TabsContent>

                <TabsContent value="alerts">
                    <AlertsTab watchlistId={watchlistId} />
                </TabsContent>

                <TabsContent value="scans">
                    <ScansTab watchlistId={watchlistId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
