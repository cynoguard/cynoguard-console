"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
    AlertTriangle,
    CheckCircle2,
    Globe,
    Loader2,
    Pause,
    Play,
    Plus,
    RefreshCw,
    RotateCcw,
    Search,
    ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleActive, useTriggerScan, useWatchlist } from "@/hooks/use-domain-monitoring";
import type { WatchlistEntry } from "@/types/domain-monitoring";
import { AddDomainDialog } from "./add-domain-dialog";

// ── Status Helpers ──────────────────────────────────────────────────

function ScanStatusBadge({ status }: { status?: WatchlistEntry["lastScanStatus"] }) {
    switch (status) {
        case "running":
            return (
                <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Running
                </Badge>
            );
        case "success":
            return (
                <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Success
                </Badge>
            );
        case "error":
            return (
                <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Error
                </Badge>
            );
        default:
            return (
                <Badge variant="outline" className="text-muted-foreground">
                    Idle
                </Badge>
            );
    }
}

function ActiveBadge({ active }: { active: boolean }) {
    return active ? (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            Active
        </Badge>
    ) : (
        <Badge variant="outline" className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
            Paused
        </Badge>
    );
}

const emptySubscribe = () => () => {};

function useIsClient() {
    return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

// ── Row Actions ─────────────────────────────────────────────────────

function RowActions({ entry }: { entry: WatchlistEntry }) {
    const toggleActive = useToggleActive(entry.id);
    const triggerScan = useTriggerScan(entry.id);

    const handleScanNow = () => {
        triggerScan.mutate(undefined, {
            onSuccess: () => toast.success(`Scan started for ${entry.officialDomainNormalized}`),
            onError: () => toast.error("Failed to start scan"),
        });
    };

    const handleToggle = () => {
        const newState = !entry.active;
        toggleActive.mutate(newState, {
            onSuccess: () =>
                toast.success(
                    `${entry.officialDomainNormalized} ${newState ? "resumed" : "paused"}`
                ),
            onError: () => toast.error("Failed to update status"),
        });
    };

    return (
        <div className="flex items-center gap-1">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleScanNow}
                            disabled={triggerScan.isPending || entry.lastScanStatus === "running"}
                            aria-label="Scan now"
                        >
                            {triggerScan.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Scan now</TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleToggle}
                            disabled={toggleActive.isPending}
                            aria-label={entry.active ? "Pause monitoring" : "Resume monitoring"}
                        >
                            {entry.active ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <RotateCcw className="h-4 w-4" />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {entry.active ? "Pause" : "Resume"}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

// ── Loading Skeleton ────────────────────────────────────────────────

function WatchlistSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-8 w-20" />
                </div>
            ))}
        </div>
    );
}

// ── Empty State ─────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-6">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-xl" />
                    <div className="relative rounded-full bg-primary/10 p-6">
                        <ShieldAlert className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">No domains monitored yet</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                    Add your first domain to start monitoring for typosquatting, phishing look-alikes, and suspicious registrations.
                </p>
                <Button onClick={onAdd} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add your first domain
                </Button>
            </CardContent>
        </Card>
    );
}

// ── Main Component ──────────────────────────────────────────────────

export function WatchlistOverview() {
    const { data: watchlist, isLoading, isError, refetch } = useWatchlist();
    const [dialogOpen, setDialogOpen] = useState(false);
    const isClient = useIsClient();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Globe className="h-6 w-6 text-primary" />
                        Domain Monitoring
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor your domains for look-alikes, typosquatting, and phishing threats.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        className="gap-1.5"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                    </Button>
                    <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
                        <Plus className="h-4 w-4" />
                        Add domain
                    </Button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <Card>
                    <WatchlistSkeleton />
                </Card>
            ) : isError ? (
                <Card className="border-destructive/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Failed to load watchlist</h3>
                        <p className="text-muted-foreground mb-4">
                            Something went wrong while fetching your monitored domains.
                        </p>
                        <Button variant="outline" onClick={() => refetch()} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try again
                        </Button>
                    </CardContent>
                </Card>
            ) : !watchlist || watchlist.length === 0 ? (
                <EmptyState onAdd={() => setDialogOpen(true)} />
            ) : (
                <Card>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-50">Domain</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Last Scan</TableHead>
                                    <TableHead className="hidden lg:table-cell">Next Run</TableHead>
                                    <TableHead>Result</TableHead>
                                    <TableHead className="text-center">
                                        <span className="hidden sm:inline">Suspicious</span>
                                        <Search className="h-4 w-4 sm:hidden mx-auto" />
                                    </TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {watchlist.map((entry) => (
                                    <TableRow key={entry.id} className="group">
                                        <TableCell>
                                            <Link
                                                href={`/dashboard/domain-monitoring/${entry.id}`}
                                                className="font-medium hover:text-primary transition-colors"
                                            >
                                                {entry.officialDomainNormalized}
                                            </Link>
                                            {entry.officialDomainRaw !== entry.officialDomainNormalized && (
                                                <p className="text-xs text-muted-foreground truncate max-w-45">
                                                    {entry.officialDomainRaw}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ActiveBadge active={entry.active} />
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {entry.lastScanAt ? (
                                                isClient ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger className="cursor-default">
                                                                {formatDistanceToNow(new Date(entry.lastScanAt), {
                                                                    addSuffix: true,
                                                                })}
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {format(new Date(entry.lastScanAt), "PPpp")}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-muted-foreground/60">...</span>
                                                )
                                            ) : (
                                                <span className="text-muted-foreground/60">Never</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                            {entry.nextRunAt ? (
                                                isClient ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger className="cursor-default">
                                                                {formatDistanceToNow(new Date(entry.nextRunAt), {
                                                                    addSuffix: true,
                                                                })}
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {format(new Date(entry.nextRunAt), "PPpp")}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-muted-foreground/60">...</span>
                                                )
                                            ) : (
                                                <span className="text-muted-foreground/60">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <ScanStatusBadge status={entry.lastScanStatus} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {entry.suspiciousCount != null && entry.suspiciousCount > 0 ? (
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        entry.suspiciousCount >= 10
                                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                            : entry.suspiciousCount >= 5
                                                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                                                : ""
                                                    }
                                                >
                                                    {entry.suspiciousCount}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground/60">0</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <RowActions entry={entry} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Card>
            )}

            {/* Add Domain Dialog */}
            <AddDomainDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </div>
    );
}
