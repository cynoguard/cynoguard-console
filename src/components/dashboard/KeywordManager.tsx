"use client"

import { useCallback, useEffect, useState } from "react"
import type { Keyword } from "@/lib/types/social-alert"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { useToast } from "@/hooks/use-toast"
import {
  Plus,
  Trash2,
  Hash,
  Loader2,
  Inbox,
} from "lucide-react"

const chartConfig: ChartConfig = {
  mentionCount: { label: "Mentions", color: "#3b82f6" },
}

export function KeywordManager() {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const fetchKeywords = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/keywords")
      if (!res.ok) throw new Error("Failed")
      const data: Keyword[] = await res.json()
      setKeywords(data)
    } catch {
      toast({ title: "Error", description: "Failed to load keywords.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  async function handleAdd() {
    const values = inputValue
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length >= 2)

    if (values.length === 0) {
      setError("Keywords must be at least 2 characters.")
      return
    }

    const duplicates = values.filter((v) =>
      keywords.some((k) => k.value.toLowerCase() === v.toLowerCase())
    )
    if (duplicates.length > 0) {
      setError(`Duplicate keyword(s): ${duplicates.join(", ")}`)
      return
    }

    setAdding(true)
    setError("")

    try {
      for (const value of values) {
        const res = await fetch("/api/keywords", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        })
        if (!res.ok) throw new Error("Failed to add keyword")
        const newKw: Keyword = await res.json()
        setKeywords((prev) => [...prev, newKw])
      }
      setInputValue("")
      toast({
        title: "Keyword Added",
        description: `Added ${values.length} keyword${values.length > 1 ? "s" : ""}.`,
      })
    } catch {
      toast({ title: "Error", description: "Failed to add keyword.", variant: "destructive" })
    } finally {
      setAdding(false)
    }
  }

  function handleDelete(id: string) {
    setKeywords((prev) => prev.filter((k) => k.id !== id))
    toast({ title: "Keyword Deleted", description: "The keyword has been removed." })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  /* ── chart data for top keywords ── */
  const chartData = [...keywords]
    .filter((k) => (k.mentionCount ?? 0) > 0)
    .sort((a, b) => (b.mentionCount ?? 0) - (a.mentionCount ?? 0))
    .slice(0, 7)
    .map((k) => ({ keyword: k.value, mentionCount: k.mentionCount ?? 0 }))

  /* ── render ── */
  return (
    <div className="flex flex-col gap-6">
      {/* Add keyword section */}
      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Add Keywords</h3>
        <p className="mb-3 text-xs text-slate-500">
          Enter keywords to track. Separate multiple keywords with commas.
        </p>
        <div className="flex items-center gap-2">
          <Input
            placeholder='e.g. "CynoGuard, bot detection, phishing"'
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError("")
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="text-sm"
          />
          <Button
            onClick={handleAdd}
            disabled={adding || !inputValue.trim()}
            className="gap-1.5 bg-[#0a1120] hover:bg-[#1a253a]"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Add
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </Card>

      {/* Keyword list */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Tracked Keywords
            {!loading && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                {keywords.length} keyword{keywords.length !== 1 ? "s" : ""}
              </span>
            )}
          </h3>
        </div>

        {loading ? (
          <div className="flex flex-col gap-2 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`kw-sk-${i}`} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Inbox className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No keywords added yet</p>
            <p className="text-xs text-slate-400">
              Add your first keyword above to start monitoring.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Mentions</TableHead>
                  <TableHead className="w-[120px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((kw) => (
                  <TableRow key={kw.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">
                          {kw.value}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          kw.isActive
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20 text-[10px]"
                        }
                      >
                        {kw.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {(kw.mentionCount ?? 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {formatDate(kw.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete {kw.value}</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete keyword?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will stop monitoring for &ldquo;{kw.value}&rdquo; and
                              remove it from your tracked keywords.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(kw.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Top keywords chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Top Performing Keywords
          </h3>
          <ChartContainer
            config={chartConfig}
            className="aspect-[2/1] w-full max-h-[260px]"
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e2e8f0"
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis
                dataKey="keyword"
                type="category"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
                width={100}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="mentionCount"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
                barSize={24}
              />
            </BarChart>
          </ChartContainer>
        </Card>
      )}
    </div>
  )
}
