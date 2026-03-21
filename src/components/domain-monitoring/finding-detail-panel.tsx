"use client";

import { format } from "date-fns";
import {
    Download,
    ExternalLink,
    FileText,
    Lock,
    Server,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { Finding } from "@/types/domain-monitoring";

// ── Helpers ─────────────────────────────────────────────────────────

function SimilarityIndicator({ score }: { score: number }) {
    const pct = Math.round(score * 100);
    const level = score >= 0.9 ? "High" : score >= 0.8 ? "Medium" : "Low";
    const color =
        score >= 0.9
            ? "text-red-400"
            : score >= 0.8
                ? "text-yellow-400"
                : "text-emerald-400";

    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-3xl font-bold tabular-nums">{pct}%</p>
                <p className={`text-sm font-medium ${color}`}>{level} similarity</p>
            </div>
            <div className="w-20 h-20 relative">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        className="text-muted"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        className={color}
                        strokeWidth="3"
                        strokeDasharray={`${pct}, 100`}
                        strokeLinecap="round"
                    />
                </svg>
            </div>
        </div>
    );
}

function InfoRow({
    label,
    value,
    badge,
}: {
    label: string;
    value: string | undefined;
    badge?: { variant: "success" | "warning" | "danger" | "default"; text: string };
}) {
    if (!value && !badge) return null;
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-muted-foreground">{label}</span>
            {badge ? (
                <Badge
                    variant="outline"
                    className={
                        badge.variant === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : badge.variant === "warning"
                                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                                : badge.variant === "danger"
                                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                                    : ""
                    }
                >
                    {badge.text}
                </Badge>
            ) : (
                <span className="text-sm font-medium">{value}</span>
            )}
        </div>
    );
}

// ── Component ───────────────────────────────────────────────────────

interface FindingDetailPanelProps {
    finding: Finding | null;
    open: boolean;
    onClose: () => void;
}

export function FindingDetailPanel({
    finding,
    open,
    onClose,
}: FindingDetailPanelProps) {
    if (!finding) return null;

    const dns = finding.dnsSignals;
    const whois = finding.whoisSignals;
    const ssl = finding.sslSignals;

    const handleExportJson = () => {
        const blob = new Blob([JSON.stringify(finding, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `finding-${finding.candidateDomain}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("JSON exported");
    };

    const sslBadge = ssl?.sslStatus
        ? {
            variant: (ssl.sslStatus === "valid"
                ? "success"
                : ssl.sslStatus === "expired"
                    ? "warning"
                    : "default") as "success" | "warning" | "default",
            text: ssl.sslStatus.charAt(0).toUpperCase() + ssl.sslStatus.slice(1),
        }
        : undefined;

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader className="space-y-3 pb-4">
                    <div className="flex items-start justify-between">
                        <SheetTitle className="text-lg break-all pr-8">
                            {finding.candidateDomain}
                        </SheetTitle>
                    </div>
                    {finding.isLive ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 w-fit">
                            Live
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-muted-foreground w-fit">
                            Offline
                        </Badge>
                    )}
                </SheetHeader>

                <div className="space-y-6 pb-6">
                    {/* Similarity */}
                    <SimilarityIndicator score={finding.similarityScore} />
                    <InfoRow
                        label="Edit distance"
                        value={String(finding.levenshteinDistance)}
                    />
                    <InfoRow
                        label="First seen"
                        value={format(new Date(finding.firstSeenAt), "PPp")}
                    />
                    <InfoRow
                        label="Last seen"
                        value={format(new Date(finding.lastSeenAt), "PPp")}
                    />

                    {/* Risk Reasons */}
                    {finding.riskReason && finding.riskReason.length > 0 && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-red-400" />
                                    Risk Indicators
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {finding.riskReason.map((r, i) => (
                                        <Badge key={i} variant="outline" className="border-red-500/20 bg-red-500/5 text-red-400 text-xs">
                                            {r}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* DNS */}
                    {dns && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Server className="h-4 w-4" />
                                    DNS Records
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {(["hasA", "hasAAAA", "hasCNAME", "hasNS", "hasMX"] as const).map(
                                        (key) => (
                                            <div
                                                key={key}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <div
                                                    className={`h-2 w-2 rounded-full ${dns[key] ? "bg-emerald-400" : "bg-muted-foreground/30"
                                                        }`}
                                                />
                                                <span className={dns[key] ? "text-foreground" : "text-muted-foreground"}>
                                                    {key.replace("has", "")}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* WHOIS */}
                    {whois && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    WHOIS Information
                                </h4>
                                <InfoRow
                                    label="Registered"
                                    badge={
                                        whois.isRegistered
                                            ? { variant: "warning", text: "Yes" }
                                            : { variant: "default", text: "No" }
                                    }
                                    value={undefined}
                                />
                                <InfoRow label="Registrar" value={whois.registrar} />
                                {whois.createdAt && (
                                    <InfoRow
                                        label="Created"
                                        value={format(new Date(whois.createdAt), "PP")}
                                    />
                                )}
                                {whois.expiresAt && (
                                    <InfoRow
                                        label="Expires"
                                        value={format(new Date(whois.expiresAt), "PP")}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {/* SSL */}
                    {ssl && (
                        <>
                            <Separator />
                            <div>
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Lock className="h-4 w-4" />
                                    SSL Certificate
                                </h4>
                                {sslBadge && (
                                    <InfoRow label="Status" value={undefined} badge={sslBadge} />
                                )}
                                {ssl.expiresAt && (
                                    <InfoRow
                                        label="Expires"
                                        value={format(new Date(ssl.expiresAt), "PP")}
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <Separator />
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={handleExportJson}
                        >
                            <Download className="h-3.5 w-3.5" />
                            Export JSON
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            asChild
                        >
                            <a
                                href={`https://${finding.candidateDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open domain
                            </a>
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
