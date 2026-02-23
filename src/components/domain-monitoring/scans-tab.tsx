"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Clock,
    BarChart3,
} from "lucide-react";

import { useScans } from "@/hooks/use-domain-monitoring";
import type { Scan } from "@/types/domain-monitoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

// ── Helpers ─────────────────────────────────────────────────────────

function ScanStatusBadge({ status }: { status: Scan["status"] }) {
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
    }
}

function getDuration(scan: Scan): string {
    if (!scan.finishedAt) return "—";
    const start = new Date(scan.startedAt).getTime();
    const end = new Date(scan.finishedAt).getTime();
    const seconds = Math.round((end - start) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}m ${remaining}s`;
}

// ── Scan Detail Dialog ──────────────────────────────────────────────

function ScanDetailDialog({
    scan,
    open,
    onOpenChange,
}: {
    scan: Scan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    if (!scan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Scan Summary
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <ScanStatusBadge status={scan.status} />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Started</span>
                        <span className="text-sm font-medium">
                            {format(new Date(scan.startedAt), "PPpp")}
                        </span>
                    </div>
                    {scan.finishedAt && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Finished</span>
                            <span className="text-sm font-medium">
                                {format(new Date(scan.finishedAt), "PPpp")}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Duration</span>
                        <span className="text-sm font-medium">{getDuration(scan)}</span>
                    </div>

                    <div className="border rounded-lg p-4 grid grid-cols-3 gap-4 bg-muted/30">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{scan.totals.totalCandidates.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Candidates</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-400">{scan.totals.totalLiveFound}</p>
                            <p className="text-xs text-muted-foreground">Live Found</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-2xl font-bold ${scan.totals.errors > 0 ? "text-red-400" : ""}`}>
                                {scan.totals.errors}
                            </p>
                            <p className="text-xs text-muted-foreground">Errors</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ── Skeleton ────────────────────────────────────────────────────────

function ScansSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                </div>
            ))}
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────

interface ScansTabProps {
    watchlistId: string;
}

export function ScansTab({ watchlistId }: ScansTabProps) {
    const [page, setPage] = useState(1);
    const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
    const { data, isLoading, isError } = useScans(watchlistId, { page, pageSize: 10 });

    const scans = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / (data?.pageSize ?? 10));

    return (
        <>
            <Card>
                <CardContent className="p-4">
                    {isLoading ? (
                        <ScansSkeleton />
                    ) : isError ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Failed to load scan history. Please try again.
                        </div>
                    ) : scans.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="relative mx-auto mb-4 w-fit">
                                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/10 blur-lg" />
                                <div className="relative rounded-full bg-primary/10 p-4">
                                    <Clock className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-1">No scans yet</h3>
                            <p className="text-muted-foreground text-sm">
                                Scan history will appear here after the first scan runs.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[140px]">Started</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden sm:table-cell text-center">Candidates</TableHead>
                                            <TableHead className="hidden sm:table-cell text-center">Live</TableHead>
                                            <TableHead className="hidden md:table-cell text-center">Errors</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {scans.map((scan) => (
                                            <TableRow
                                                key={scan.id}
                                                className="cursor-pointer hover:bg-muted/50"
                                                onClick={() => setSelectedScan(scan)}
                                            >
                                                <TableCell className="text-sm">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger className="cursor-pointer text-muted-foreground hover:text-foreground">
                                                                {formatDistanceToNow(new Date(scan.startedAt), {
                                                                    addSuffix: true,
                                                                })}
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                {format(new Date(scan.startedAt), "PPpp")}
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {getDuration(scan)}
                                                </TableCell>
                                                <TableCell>
                                                    <ScanStatusBadge status={scan.status} />
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell text-center text-sm">
                                                    {scan.totals.totalCandidates.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="hidden sm:table-cell text-center text-sm text-emerald-400">
                                                    {scan.totals.totalLiveFound}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-center text-sm">
                                                    {scan.totals.errors > 0 ? (
                                                        <span className="text-red-400">{scan.totals.errors}</span>
                                                    ) : (
                                                        <span className="text-muted-foreground">0</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        {total} scan{total !== 1 ? "s" : ""} total
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

            {/* Scan Detail Dialog */}
            <ScanDetailDialog
                scan={selectedScan}
                open={!!selectedScan}
                onOpenChange={(v) => !v && setSelectedScan(null)}
            />
        </>
    );
}
