"use client";

import {
  fetchMentions, resolveMention,
  type BrandMention, type MentionFilters,
  type MentionStatus, type RiskLevel, type Sentiment,
} from "@/lib/api/social-monitoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Inbox, RefreshCw } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const sentimentStyles: Record<string, string> = {
  POSITIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  NEUTRAL:  "bg-zinc-800/50 text-zinc-400 border-zinc-700",
  NEGATIVE: "bg-red-500/10 text-red-400 border-red-500/30",
};
const riskStyles: Record<string, string> = {
  LOW:    "bg-green-500/10 text-green-400 border-green-500/30",
  MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  HIGH:   "bg-red-500/10 text-red-400 border-red-500/30",
};
const statusStyles: Record<string, string> = {
  NEW:       "bg-blue-500/10 text-blue-400 border-blue-500/30",
  VIEWED:    "bg-zinc-800/50 text-zinc-400 border-zinc-700",
  DISMISSED: "bg-zinc-800/30 text-zinc-600 border-zinc-800",
  ARCHIVED:  "bg-zinc-800/30 text-zinc-600 border-zinc-800",
};

export default function FeedPage() {
  const [mentions,        setMentions]        = useState<BrandMention[]>([]);
  const [total,           setTotal]           = useState(0);
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);
  const [resolvingId,     setResolvingId]     = useState<string | null>(null);
  const [riskFilter,      setRiskFilter]      = useState("ALL");
  const [sentimentFilter, setSentimentFilter] = useState("ALL");
  const [statusFilter,    setStatusFilter]    = useState("ALL");

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      const filters: MentionFilters = {
        limit:     50,
        riskLevel: riskFilter      !== "ALL" ? riskFilter      as RiskLevel     : undefined,
        sentiment: sentimentFilter !== "ALL" ? sentimentFilter as Sentiment     : undefined,
        status:    statusFilter    !== "ALL" ? statusFilter    as MentionStatus : undefined,
      };
      const res = await fetchMentions(filters);
      setMentions(res.data);
      setTotal(res.pagination.total);
    } catch { toast.error("Failed to load mentions"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [riskFilter, sentimentFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleResolve(mentionId: string) {
    setResolvingId(mentionId);
    try {
      await resolveMention(mentionId);
      setMentions(prev => prev.map(m => m.id === mentionId ? { ...m, status: "DISMISSED" as MentionStatus } : m));
      toast.success("Mention resolved");
    } catch { toast.error("Failed to resolve"); }
    finally { setResolvingId(null); }
  }

  function openTweet(m: BrandMention) {
    const url = m.tweetUrl ?? `https://x.com/${m.authorUsername}/status/${m.externalId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const byRisk = (l: string) => mentions.filter(m => m.riskLevel === l).length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Feed</h1>
          <p className="text-zinc-500 mt-1 text-sm">Brand mentions detected across X. Total: {total.toLocaleString()}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load(true)} disabled={refreshing || loading}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-36 bg-zinc-900 border-zinc-700 text-zinc-300"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="ALL">All Risk</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-40 bg-zinc-900 border-zinc-700 text-zinc-300"><SelectValue placeholder="Sentiment" /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="ALL">All Sentiment</SelectItem>
            <SelectItem value="POSITIVE">Positive</SelectItem>
            <SelectItem value="NEUTRAL">Neutral</SelectItem>
            <SelectItem value="NEGATIVE">Negative</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-zinc-900 border-zinc-700 text-zinc-300"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="VIEWED">Viewed</SelectItem>
            <SelectItem value="DISMISSED">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full bg-zinc-800/50" />)}
          </div>
        ) : mentions.length === 0 ? (
          <div className="p-12 text-center text-zinc-600">
            <Inbox className="mx-auto h-6 w-6 mb-2 opacity-50" />
            <p className="text-sm">No mentions found — try different filters or run a scan from the overview.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  {["Platform","Author","Content","Risk","Sentiment","Keyword","Status","Date","Actions"].map(h =>
                    <TableHead key={h} className="text-zinc-500 text-xs uppercase">{h}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {mentions.map(m => (
                  <TableRow key={m.id} className="border-zinc-800 hover:bg-zinc-800/20">
                    <TableCell><FaXTwitter className="h-3.5 w-3.5 text-zinc-400" /></TableCell>
                    <TableCell className="text-sm text-zinc-400">@{m.authorUsername}</TableCell>
                    <TableCell className="max-w-xs"><p className="text-xs text-zinc-400 truncate max-w-[220px]">{m.content}</p></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${riskStyles[m.riskLevel]}`}>{m.riskLevel}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${sentimentStyles[m.sentiment]}`}>{m.sentiment.toLowerCase()}</Badge></TableCell>
                    <TableCell className="text-xs text-zinc-500">{m.matchedKeyword ?? "—"}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${statusStyles[m.status]}`}>{m.status.toLowerCase()}</Badge></TableCell>
                    <TableCell className="text-xs text-zinc-500">{new Date(m.publishedAt ?? m.scannedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openTweet(m)}
                          className="h-7 px-2 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200" title="View on X">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                        {m.status !== "DISMISSED" && m.status !== "ARCHIVED" ? (
                          <Button size="sm" variant="outline" disabled={resolvingId === m.id}
                            onClick={() => handleResolve(m.id)} className="h-7 text-xs border-zinc-700 hover:bg-zinc-800">
                            {resolvingId === m.id ? "..." : "Resolve"}
                          </Button>
                        ) : (
                          <span className="text-[10px] text-zinc-600 px-2">{m.status.toLowerCase()}</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {!loading && mentions.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Shown",  value: mentions.length, color: "" },
            { label: "High Risk",    value: byRisk("HIGH"),   color: "text-red-400" },
            { label: "Medium Risk",  value: byRisk("MEDIUM"), color: "text-yellow-400" },
            { label: "Low Risk",     value: byRisk("LOW"),    color: "text-green-400" },
          ].map(item => (
            <Card key={item.label} className="p-4 bg-zinc-900/50 border-zinc-800">
              <p className="text-xs text-zinc-500">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}