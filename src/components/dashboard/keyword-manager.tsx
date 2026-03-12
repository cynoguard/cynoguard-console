"use client"

import { useCallback, useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Hash, Loader2, Inbox } from "lucide-react"
import {
  fetchKeywords, addKeyword, deleteKeyword,
  toFrontendKeyword, type BackendKeyword,
} from "@/services/api/social-monitoring"

type FrontendKeyword = ReturnType<typeof toFrontendKeyword>

export function KeywordManager() {
  const [keywords, setKeywords] = useState<FrontendKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const loadKeywords = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchKeywords()
      setKeywords(data.map(toFrontendKeyword))
    } catch {
      toast({ title: "Error", description: "Failed to load keywords.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadKeywords() }, [loadKeywords])

  async function handleAdd() {
    const values = inputValue.split(",").map((v) => v.trim()).filter((v) => v.length >= 2)

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

    // Add keywords one by one (backend accepts one at a time)
    let successCount = 0
    for (const value of values) {
      try {
        const created = await addKeyword(value)
        setKeywords((prev) => [...prev, toFrontendKeyword(created as BackendKeyword)])
        successCount++
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed"
        if (msg.includes("409") || msg.includes("already exists")) {
          setError(`"${value}" already exists`)
        } else if (msg.includes("422")) {
          setError("Maximum 50 keywords per project reached")
          break
        } else {
          toast({ title: "Error", description: `Failed to add "${value}"`, variant: "destructive" })
        }
      }
    }

    if (successCount > 0) {
      setInputValue("")
      toast({
        title: "Keyword Added",
        description: `${successCount} keyword${successCount > 1 ? "s" : ""} added.`,
      })
    }

    setAdding(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteKeyword(id)
      setKeywords((prev) => prev.filter((k) => k.id !== id))
      toast({ title: "Keyword Deleted", description: "The keyword has been removed." })
    } catch {
      toast({ title: "Error", description: "Failed to delete keyword.", variant: "destructive" })
    } finally {
      setDeletingId(null)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    })
  }

  const chartData = [...keywords]
    .filter((k) => (k.mentionCount ?? 0) > 0)
    .sort((a, b) => (b.mentionCount ?? 0) - (a.mentionCount ?? 0))
    .slice(0, 7)
    .map((k) => ({ keyword: k.value, mentionCount: k.mentionCount ?? 0 }))

  return (
    <div className="flex flex-col gap-6">

      {/* Add Keyword */}
      <Card className="p-6">
        <h3 className="mb-1 text-sm font-semibold">Add Keywords</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Separate multiple keywords with commas. Max 50 per project.
        </p>
        <div className="flex items-center gap-2">
          <Input
            placeholder='e.g. "CynoGuard, bot detection, phishing"'
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setError("") }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={adding || !inputValue.trim()}>
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
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
            <p className="mt-2 text-sm">No keywords added yet</p>
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
                    <TableCell>{kw.mentionCount}</TableCell>
                    <TableCell>{formatDate(kw.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deletingId === kw.id}
                        onClick={() => handleDelete(kw.id)}
                      >
                        {deletingId === kw.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
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
          <h3 className="mb-4 text-sm font-semibold">Top Performing Keywords</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
              <XAxis type="number" stroke="#71717a" fontSize={12} />
              <YAxis dataKey="keyword" type="category" stroke="#71717a" fontSize={12} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "#020817",
                  border: "1px solid #1f2937",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  color: "#e5e7eb",
                  fontSize: "13px",
                }}
                formatter={(value: number) => [`${value}`, "Mentions"]}
              />
              <Bar dataKey="mentionCount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

    </div>
  )
}