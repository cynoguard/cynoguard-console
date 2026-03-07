"use client"

import { useCallback, useEffect, useState } from "react"
import type { Keyword } from "@/types/keyword"

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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Hash, Loader2, Inbox } from "lucide-react"

/* -------------------------------------------------------------------------- */
/* Mock Data */
/* -------------------------------------------------------------------------- */

const mockKeywordsData: Keyword[] = [
  { id: "1", value: "CynoGuard", isActive: true, mentionCount: 432, createdAt: "2026-01-15" },
  { id: "2", value: "bot detection", isActive: true, mentionCount: 287, createdAt: "2026-01-15" },
  { id: "3", value: "CynoGuard API", isActive: true, mentionCount: 156, createdAt: "2026-01-20" },
  { id: "4", value: "CynoGuard Support", isActive: true, mentionCount: 98, createdAt: "2026-01-22" },
  { id: "5", value: "CynoGuard pricing", isActive: false, mentionCount: 45, createdAt: "2026-02-01" },
  { id: "6", value: "CynoGuard login", isActive: true, mentionCount: 73, createdAt: "2026-02-05" },
  { id: "7", value: "CynoGuard dashboard", isActive: true, mentionCount: 61, createdAt: "2026-02-10" },
]

export function KeywordManager() {

  const [keywords, setKeywords] = useState<Keyword[]>(mockKeywordsData)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")

  const { toast } = useToast()

  const fetchKeywords = useCallback(async () => {
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  /* -------------------------------------------------------------------------- */
  /* Add Keyword */
  /* -------------------------------------------------------------------------- */

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

      const newKeywords: Keyword[] = values.map((value, index) => ({
        id: String(Date.now() + index),
        value,
        isActive: true,
        mentionCount: 0,
        createdAt: new Date().toISOString(),
      }))

      setKeywords((prev) => [...prev, ...newKeywords])
      setInputValue("")

      toast({
        title: "Keyword Added",
        description: `${values.length} keyword${values.length > 1 ? "s" : ""} added.`,
      })

    } catch {

      toast({
        title: "Error",
        description: "Failed to add keyword.",
        variant: "destructive",
      })

    } finally {
      setAdding(false)
    }
  }

  /* -------------------------------------------------------------------------- */
  /* Delete Keyword */
  /* -------------------------------------------------------------------------- */

  function handleDelete(id: string) {

    setKeywords((prev) => prev.filter((k) => k.id !== id))

    toast({
      title: "Keyword Deleted",
      description: "The keyword has been removed.",
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  /* -------------------------------------------------------------------------- */
  /* Chart Data */
  /* -------------------------------------------------------------------------- */

  const chartData = [...keywords]
    .filter((k) => (k.mentionCount ?? 0) > 0)
    .sort((a, b) => (b.mentionCount ?? 0) - (a.mentionCount ?? 0))
    .slice(0, 7)
    .map((k) => ({
      keyword: k.value,
      mentionCount: k.mentionCount ?? 0,
    }))

  /* -------------------------------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="flex flex-col gap-6">

      {/* Add Keyword */}
      <Card className="p-6">

        <h3 className="mb-4 text-sm font-semibold">
          Add Keywords
        </h3>

        <div className="flex items-center gap-2">

          <Input
            placeholder="CynoGuard, bot detection, phishing"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError("")
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          <Button onClick={handleAdd} disabled={adding || !inputValue.trim()}>

            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            Add
          </Button>

        </div>

        {error && (
          <p className="mt-2 text-xs text-red-500">
            {error}
          </p>
        )}

      </Card>

      {/* Keywords Table */}
      <Card className="overflow-hidden">

        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-semibold">
            Tracked Keywords ({keywords.length})
          </h3>
        </div>

        {loading ? (

          <div className="space-y-2 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>

        ) : keywords.length === 0 ? (

          <div className="p-12 text-center">
            <Inbox className="mx-auto h-6 w-6 opacity-50" />
            <p className="mt-2 text-sm">
              No keywords added yet
            </p>
          </div>

        ) : (

          <div className="overflow-x-auto">

            <Table>

              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mentions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {keywords.map((kw) => (
                  <TableRow key={kw.id}>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 opacity-50" />
                        {kw.value}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={kw.isActive ? "default" : "secondary"}>
                        {kw.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {kw.mentionCount}
                    </TableCell>

                    <TableCell>
                      {formatDate(kw.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(kw.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>

                  </TableRow>
                ))}

              </TableBody>

            </Table>

          </div>

        )}

      </Card>

      {/* Top Keywords Chart */}
      {chartData.length > 0 && (

        <Card className="p-6">

          <h3 className="mb-4 text-sm font-semibold">
            Top Performing Keywords
          </h3>

          <ResponsiveContainer width="100%" height={280}>

            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 100 }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#27272a"
              />

              <XAxis
                type="number"
                stroke="#71717a"
                fontSize={12}
              />

              <YAxis
                dataKey="keyword"
                type="category"
                stroke="#71717a"
                fontSize={12}
              />

              {/* FIXED TOOLTIP */}
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "#020817",
                  border: "1px solid #1f2937",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "#e5e7eb",
                  fontSize: "13px",
                  fontWeight: 500,
                }}
                formatter={(value: number) => [`${value}`, "Mentions"]}
              />

              <Bar
                dataKey="mentionCount"
                fill="#3b82f6"
                radius={[0, 4, 4, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </Card>

      )}

    </div>
  )
}