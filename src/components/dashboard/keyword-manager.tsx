// src/components/dashboard/keyword-manager.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  createKeyword,
  getKeywords,
  patchKeyword, removeKeyword,
  type Keyword,
} from "@/services/api/social-monitoring";
import { Hash, Inbox, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props { projectId: string }

export function KeywordManager({ projectId }: Props) {
  const [keywords,   setKeywords]   = useState<Keyword[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [input,      setInput]      = useState("");
  const [adding,     setAdding]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error,      setError]      = useState("");
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try   { setKeywords(await getKeywords(projectId)); }
    catch { toast({ title: "Error", description: "Failed to load keywords.", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [projectId, toast]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    const values = input.split(",").map((v) => v.trim()).filter((v) => v.length >= 2);
    if (!values.length) { setError("Keywords must be at least 2 characters."); return; }

    const dupes = values.filter((v) =>
      keywords.some((k) => k.keyword.toLowerCase() === v.toLowerCase())
    );
    if (dupes.length) { setError(`Already tracked: ${dupes.join(", ")}`); return; }

    setAdding(true);
    setError("");
    let ok = 0;

    for (const value of values) {
      try {
        const created = await createKeyword(projectId, value);
        setKeywords((prev) => [created, ...prev]);
        ok++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("409") || msg.toLowerCase().includes("already exists")) {
          setError(`"${value}" already exists`);
        } else if (msg.includes("422")) {
          setError("Maximum 50 keywords per project reached"); break;
        } else {
          toast({ title: "Error", description: `Failed to add "${value}"`, variant: "destructive" });
        }
      }
    }

    if (ok > 0) {
      setInput("");
      toast({ title: "Added", description: `${ok} keyword${ok > 1 ? "s" : ""} added.` });
    }
    setAdding(false);
  }

  async function handleToggle(kw: Keyword) {
    try {
      const updated = await patchKeyword(projectId, kw.id, !kw.isActive);
      setKeywords((prev) => prev.map((k) => (k.id === kw.id ? updated : k)));
    } catch {
      toast({ title: "Error", description: "Failed to update keyword.", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await removeKeyword(projectId, id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      toast({ title: "Deleted", description: "Keyword removed." });
    } catch {
      toast({ title: "Error", description: "Failed to delete keyword.", variant: "destructive" });
    } finally { setDeletingId(null); }
  }

  const chartData = [...keywords]
    .filter((k) => k.mentionCount > 0)
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 7)
    .map((k) => ({ keyword: k.keyword, mentions: k.mentionCount }));

  return (
    <div className="flex flex-col gap-6">

      {/* Add */}
      <Card className="p-6">
        <h3 className="mb-1 text-sm font-semibold">Add Keywords</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Separate multiple with commas. Max 50 per project.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder='e.g. "CynoGuard, phishing, bot detection"'
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={adding || !input.trim()}>
            {adding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Add
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="border-b px-6 py-4">
          <h3 className="text-sm font-semibold">Tracked Keywords ({keywords.length})</h3>
        </div>

        {loading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : keywords.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Inbox className="mx-auto h-6 w-6 opacity-50" />
            <p className="mt-2 text-sm">No keywords yet — add one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mentions</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map((kw) => (
                  <TableRow key={kw.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 opacity-50" />
                        {kw.keyword}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={kw.isActive ? "default" : "secondary"}
                        className="cursor-pointer select-none"
                        onClick={() => handleToggle(kw)}
                      >
                        {kw.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell>{kw.mentionCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(kw.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm" variant="ghost"
                        disabled={deletingId === kw.id}
                        onClick={() => handleDelete(kw.id)}
                      >
                        {deletingId === kw.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4 text-destructive" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold">Top Keywords by Mentions</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#27272a" />
              <XAxis type="number" stroke="#71717a" fontSize={12} />
              <YAxis dataKey="keyword" type="category" stroke="#71717a" fontSize={12} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: 8, fontSize: 13 }}
                formatter={(v: number) => [v, "Mentions"]}
              />
              <Bar dataKey="mentions" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

    </div>
  );
}