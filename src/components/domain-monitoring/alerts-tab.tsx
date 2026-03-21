"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
    AlertTriangle,
    Bell,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";

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
import { useAlerts } from "@/hooks/use-domain-monitoring";

// ── Skeleton ────────────────────────────────────────────────────────

function AlertsSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-24" />
                </div>
            ))}
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────

interface AlertsTabProps {
    watchlistId: string;
}

export function AlertsTab({ watchlistId }: AlertsTabProps) {
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useAlerts(watchlistId, { page, pageSize: 10 });

    const alerts = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / (data?.pageSize ?? 10));

    return (
        <Card>
            <CardContent className="p-4">
                {isLoading ? (
                    <AlertsSkeleton />
                ) : isError ? (
                    <div className="py-8 text-center text-muted-foreground">
                        Failed to load alerts. Please try again.
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="relative mx-auto mb-4 w-fit">
                            <div className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/10 blur-lg" />
                            <div className="relative rounded-full bg-emerald-500/10 p-4">
                                <Bell className="h-8 w-8 text-emerald-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No alerts yet</h3>
                        <p className="text-muted-foreground text-sm">
                            Alerts will appear here when suspicious domain activity is detected.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[140px]">Time</TableHead>
                                        <TableHead className="min-w-[180px]">Domain</TableHead>
                                        <TableHead className="min-w-[200px]">Reason</TableHead>
                                        <TableHead className="hidden md:table-cell">Highlights</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alerts.map((alert) => (
                                        (() => {
                                            const payload = alert.payload as {
                                                similarityScore?: number;
                                                isLive?: boolean;
                                                hasMX?: boolean;
                                                sslStatus?: string;
                                            };
                                            return (
                                        <TableRow key={alert.id}>
                                            <TableCell className="text-sm">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="cursor-default text-muted-foreground">
                                                            {formatDistanceToNow(new Date(alert.triggeredAt), {
                                                                addSuffix: true,
                                                            })}
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {format(new Date(alert.triggeredAt), "PPpp")}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell className="font-medium text-sm">
                                                {alert.candidateDomain}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                                                    <span className="text-sm">{alert.reason}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {payload.similarityScore != null && (
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                            {Math.round(Number(payload.similarityScore) * 100)}% match
                                                        </Badge>
                                                    )}
                                                    {payload.isLive && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        >
                                                            Live
                                                        </Badge>
                                                    )}
                                                    {payload.hasMX && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20"
                                                        >
                                                            MX
                                                        </Badge>
                                                    )}
                                                    {payload.sslStatus && (
                                                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                            SSL: {String(payload.sslStatus)}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                            );
                                        })()
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-3">
                                <p className="text-xs text-muted-foreground">
                                    {total} alert{total !== 1 ? "s" : ""} total
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page <= 1}
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-3.5 w-3.5" />
                                    </Button>
                                    <span className="text-xs px-2 tabular-nums">
                                        {page} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page >= totalPages}
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
