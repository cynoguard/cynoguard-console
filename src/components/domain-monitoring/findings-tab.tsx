"use client";

import { useState } from "react";
import {
    Search,
    Copy,
    ChevronLeft,
    ChevronRight,
    Check,
    Filter,
    Download,
    ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

import { useFindings } from "@/hooks/use-domain-monitoring";
import type { Finding, FindingsQuery } from "@/types/domain-monitoring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { FindingDetailPanel } from "./finding-detail-panel";

// ── Helpers ─────────────────────────────────────────────────────────

function SimilarityBar({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const color =
        score >= 0.9
            ? "bg-red-500"
            : score >= 0.8
                ? "bg-yellow-500"
                : "bg-emerald-500";

    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium tabular-nums">{pct}%</span>
        </div>
    );
}

function LiveBadge({ isLive }: { isLive: boolean }) {
    return isLive ? (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
            Live
        </Badge>
    ) : (
        <Badge variant="outline" className="text-muted-foreground text-xs">
            Offline
        </Badge>
    );
}

function SignalChips({ finding }: { finding: Finding }) {
    const dns = finding.dnsSignals;
    const whois = finding.whoisSignals;
    const ssl = finding.sslSignals;

    return (
        <div className="flex flex-wrap gap-1">
            {dns?.hasA && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">A</Badge>}
            {dns?.hasNS && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">NS</Badge>}
            {dns?.hasMX && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-400 border-red-500/20">
                    MX
                </Badge>
            )}
            {whois?.isRegistered && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Reg</Badge>
            )}
            {ssl?.sslStatus === "valid" && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    SSL
                </Badge>
            )}
            {ssl?.sslStatus === "expired" && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    SSL⚠
                </Badge>
            )}
        </div>
    );
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleCopy}
                        aria-label={`Copy ${text}`}
                    >
                        {copied ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                            <Copy className="h-3 w-3" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied!" : "Copy domain"}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// ── CSV Export ───────────────────────────────────────────────────────

function exportFindingsCsv(findings: Finding[]) {
    const header = "Candidate Domain,Similarity %,Edit Distance,Live,MX,SSL,Risk Reasons\n";
    const rows = findings.map((f) =>
        [
            f.candidateDomain,
            Math.round(f.similarityScore * 100),
            f.levenshteinDistance,
            f.isLive ? "Yes" : "No",
            f.dnsSignals?.hasMX ? "Yes" : "No",
            f.sslSignals?.sslStatus ?? "unknown",
            `"${(f.riskReason ?? []).join(", ")}"`,
        ].join(",")
    );
    const csv = header + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "findings-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
}

// ── Skeleton ────────────────────────────────────────────────────────

function FindingsSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                </div>
            ))}
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────

interface FindingsTabProps {
    watchlistId: string;
}

export function FindingsTab({ watchlistId }: FindingsTabProps) {
    const [query, setQuery] = useState("");
    const [minSimilarity, setMinSimilarity] = useState<string>("0");
    const [liveOnly, setLiveOnly] = useState(false);
    const [sort, setSort] = useState<FindingsQuery["sort"]>("similarity_desc");
    const [page, setPage] = useState(1);
    const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

    const params: FindingsQuery = {
        query: query || undefined,
        minSimilarity: parseFloat(minSimilarity) || undefined,
        isLive: liveOnly || undefined,
        sort,
        page,
        pageSize: 10,
    };

    const { data, isLoading, isError } = useFindings(watchlistId, params);
    const findings = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / (data?.pageSize ?? 10));

    return (
        <>
            <Card>
                <CardContent className="p-4 space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search domains..."
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-9"
                                    aria-label="Search similar domains"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <Select
                                    value={minSimilarity}
                                    onValueChange={(val) => {
                                        setMinSimilarity(val);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[130px] h-8 text-xs">
                                        <SelectValue placeholder="Min similarity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">All scores</SelectItem>
                                        <SelectItem value="0.7">≥ 70%</SelectItem>
                                        <SelectItem value="0.8">≥ 80%</SelectItem>
                                        <SelectItem value="0.9">≥ 90%</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Switch
                                    id="live-filter"
                                    checked={liveOnly}
                                    onCheckedChange={(v) => {
                                        setLiveOnly(v);
                                        setPage(1);
                                    }}
                                    className="data-[state=checked]:bg-emerald-500"
                                />
                                <Label htmlFor="live-filter" className="text-xs cursor-pointer">
                                    Live only
                                </Label>
                            </div>

                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                                <Select
                                    value={sort}
                                    onValueChange={(val) => setSort(val as FindingsQuery["sort"])}
                                >
                                    <SelectTrigger className="w-[140px] h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="similarity_desc">Similarity ↓</SelectItem>
                                        <SelectItem value="last_seen_desc">Last seen ↓</SelectItem>
                                        <SelectItem value="first_seen_desc">First seen ↓</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => findings.length > 0 && exportFindingsCsv(findings)}
                                disabled={findings.length === 0}
                            >
                                <Download className="h-3.5 w-3.5" />
                                CSV
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <FindingsSkeleton />
                    ) : isError ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Failed to load findings. Please try again.
                        </div>
                    ) : findings.length === 0 ? (
                        <div className="py-12 text-center">
                            <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                            <p className="text-muted-foreground">No findings match your filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">Candidate Domain</TableHead>
                                        <TableHead>Similarity</TableHead>
                                        <TableHead className="hidden sm:table-cell text-center">Dist.</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="hidden md:table-cell">Signals</TableHead>
                                        <TableHead className="hidden lg:table-cell">Risk</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {findings.map((finding) => (
                                        <TableRow
                                            key={finding.id}
                                            className="group cursor-pointer hover:bg-muted/50"
                                            onClick={() => setSelectedFinding(finding)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-sm">{finding.candidateDomain}</span>
                                                    <CopyButton text={finding.candidateDomain} />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <SimilarityBar score={finding.similarityScore} />
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell text-center text-sm text-muted-foreground">
                                                {finding.levenshteinDistance}
                                            </TableCell>
                                            <TableCell>
                                                <LiveBadge isLive={finding.isLive} />
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <SignalChips finding={finding} />
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {finding.riskReason && finding.riskReason.length > 0 ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="text-xs text-muted-foreground cursor-default">
                                                                    {finding.riskReason[0]}
                                                                    {finding.riskReason.length > 1 && ` +${finding.riskReason.length - 1}`}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <ul className="space-y-0.5">
                                                                    {finding.riskReason.map((r, i) => (
                                                                        <li key={i} className="text-xs">{r}</li>
                                                                    ))}
                                                                </ul>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground/50">—</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-muted-foreground">
                                Showing {(page - 1) * (data?.pageSize ?? 10) + 1}–
                                {Math.min(page * (data?.pageSize ?? 10), total)} of {total}
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
                </CardContent>
            </Card>

            {/* Finding Detail Panel */}
            <FindingDetailPanel
                finding={selectedFinding}
                open={!!selectedFinding}
                onClose={() => setSelectedFinding(null)}
            />
        </>
    );
}
