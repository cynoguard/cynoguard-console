'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FaXTwitter } from 'react-icons/fa6';
import {
  fetchMentions, updateMentionStatus,
  type BrandMention, type RiskLevel, type Sentiment, type MentionStatus,
} from '@/services/api/social-monitoring';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

const sentimentStyles: Record<string, string> = {
  POSITIVE: 'bg-green-500/10 text-green-400 border-green-500/30',
  NEUTRAL:  'bg-muted/50 text-muted-foreground border-border',
  NEGATIVE: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const riskStyles: Record<string, string> = {
  LOW:      'bg-green-500/10 text-green-400 border-green-500/30',
  MEDIUM:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  HIGH:     'bg-orange-500/10 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function FeedPage() {
  const [mentions, setMentions] = useState<BrandMention[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMentions({
        limit: 50,
        riskLevel: riskFilter !== 'ALL' ? riskFilter as RiskLevel : undefined,
        sentiment: sentimentFilter !== 'ALL' ? sentimentFilter as Sentiment : undefined,
        status: statusFilter !== 'ALL' ? statusFilter as MentionStatus : undefined,
      });
      setMentions(res.data);
      setTotal(res.pagination.total);
    } catch {
      toast({ title: 'Error', description: 'Failed to load mentions.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [riskFilter, sentimentFilter, statusFilter, toast]);

  useEffect(() => { load(); }, [load]);

  async function handleResolve(id: string) {
    try {
      await updateMentionStatus(id, 'DISMISSED');
      setMentions((prev) => prev.map((m) => m.id === id ? { ...m, status: 'DISMISSED' } : m));
      toast({ title: 'Resolved', description: 'Mention marked as dismissed.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update mention.', variant: 'destructive' });
    }
  }

  const byRisk = (level: string) => mentions.filter((m) => m.riskLevel === level).length;

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Mentions & Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Review social media mentions, phishing attempts, and brand impersonation alerts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Risk Level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Risk Levels</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Sentiment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sentiment</SelectItem>
              <SelectItem value="NEGATIVE">Negative</SelectItem>
              <SelectItem value="NEUTRAL">Neutral</SelectItem>
              <SelectItem value="POSITIVE">Positive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="VIEWED">Viewed</SelectItem>
              <SelectItem value="DISMISSED">Dismissed</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>

        {/* Mentions Table */}
        <Card className="overflow-hidden border border-border">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h3 className="text-sm font-semibold">
              Recent Mentions
              <span className="ml-2 text-xs text-muted-foreground">{total} total</span>
            </h3>
          </div>

          {loading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="text-muted-foreground">Platform</TableHead>
                    <TableHead className="text-muted-foreground">Author</TableHead>
                    <TableHead className="text-muted-foreground">Content</TableHead>
                    <TableHead className="text-muted-foreground">Risk</TableHead>
                    <TableHead className="text-muted-foreground">Sentiment</TableHead>
                    <TableHead className="text-muted-foreground">Keyword</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mentions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        No mentions found. Upgrade X API plan to start fetching data.
                      </TableCell>
                    </TableRow>
                  ) : mentions.map((m) => (
                    <TableRow key={m.id} className="border-b border-border hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FaXTwitter className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium uppercase">{m.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">@{m.authorUsername}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{m.content}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={riskStyles[m.riskLevel]}>
                          {m.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={sentimentStyles[m.sentiment]}>
                          {m.sentiment.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{m.matchedKeyword ?? '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {m.publishedAt
                          ? new Date(m.publishedAt).toLocaleDateString()
                          : new Date(m.scannedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {m.status !== 'DISMISSED' && m.status !== 'ARCHIVED' ? (
                          <Button size="sm" variant="outline" onClick={() => handleResolve(m.id)}>
                            Resolve
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground capitalize">{m.status.toLowerCase()}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Alert Insights */}
        <Card className="p-6 border border-border">
          <h2 className="mb-6 text-xl font-semibold">Alert Insights</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Total Alerts', value: total, color: '' },
              { label: 'Critical', value: byRisk('CRITICAL'), color: 'text-red-400' },
              { label: 'High', value: byRisk('HIGH'), color: 'text-orange-400' },
              { label: 'Medium', value: byRisk('MEDIUM'), color: 'text-yellow-400' },
              { label: 'Low', value: byRisk('LOW'), color: 'text-green-400' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}