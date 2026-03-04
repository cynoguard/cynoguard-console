"use client"

import { useState, useMemo } from "react"
import type { SocialAlert } from "@/lib/types/social-alert"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Hash,
  MessageSquare,
  User,
} from "lucide-react"

/* ── colour maps ── */
const sentimentColors: Record<string, string> = {
  positive: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  neutral: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  negative: "bg-red-500/10 text-red-600 border-red-500/20",
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "X") {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const PAGE_SIZE = 5

interface MentionsTableProps {
  mentions: SocialAlert[]
  loading: boolean
}

export function MentionsTable({ mentions, loading }: MentionsTableProps) {
  const [page, setPage] = useState(0)
  const [sentimentFilter, setSentimentFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [expanded, setExpanded] = useState<SocialAlert | null>(null)

  const filtered = useMemo(() => {
    let result = [...mentions]
    if (sentimentFilter !== "all") {
      result = result.filter((m) => m.sentiment === sentimentFilter)
    }
    if (platformFilter !== "all") {
      result = result.filter((m) => m.platform === platformFilter)
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [mentions, sentimentFilter, platformFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={`tbl-sk-${i}`} className="h-12 w-full rounded" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      {/* Header + Filters */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recent Mentions</h3>
        <div className="flex items-center gap-2">
          <Select value={sentimentFilter} onValueChange={(v) => { setSentimentFilter(v); setPage(0) }}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setPage(0) }}>
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="X">X</SelectItem>
              <SelectItem value="REDDIT">Reddit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Platform</TableHead>
              <TableHead className="w-[120px]">Author</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="w-[100px]">Sentiment</TableHead>
              <TableHead className="w-[110px]">Keyword</TableHead>
              <TableHead className="w-[120px]">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-sm text-slate-400">
                  No mentions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((m) => (
                <TableRow
                  key={m.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setExpanded(m)}
                >
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <PlatformIcon platform={m.platform} />
                      <span className="text-xs">{m.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
                    {m.author || "Unknown"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 truncate max-w-[300px]">
                    {m.content}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${sentimentColors[m.sentiment]}`}
                    >
                      {m.sentiment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{m.keyword}</TableCell>
                  <TableCell className="text-xs text-slate-400">{formatDate(m.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3">
          <p className="text-xs text-slate-400">
            Showing {page * PAGE_SIZE + 1}-
            {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded detail modal */}
      <Dialog open={!!expanded} onOpenChange={(open) => !open && setExpanded(null)}>
        <DialogContent className="sm:max-w-lg">
          {expanded && (
            <>
              <DialogHeader>
                <DialogTitle className="text-slate-900">Mention Details</DialogTitle>
                <DialogDescription className="sr-only">
                  Full details for mention {expanded.id}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-5 pt-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm leading-relaxed text-slate-700">
                    {expanded.content}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Platform
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {expanded.platform}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                      <Hash className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Keyword
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {expanded.keyword}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                      <Clock className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Detected
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate(expanded.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Author
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {expanded.author || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={sentimentColors[expanded.sentiment]}
                  >
                    {expanded.sentiment}
                  </Badge>
                </div>
                {expanded.sourceUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={expanded.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original Post
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
