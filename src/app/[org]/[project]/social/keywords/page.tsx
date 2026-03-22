"use client";

import {
  addKeyword, deleteKeyword, fetchKeywords,
  toggleKeyword, type Keyword,
} from "@/lib/api/social-monitoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hash, Inbox, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function KeywordsPage() {
  const [keywords,   setKeywords]   = useState<Keyword[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [input,      setInput]      = useState("");
  const [adding,     setAdding]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error,      setError]      = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setKeywords(await fetchKeywords()); }
    catch { toast.error("Failed to load keywords"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    const values = input.split(",").map(v => v.trim()).filter(v => v.length >= 2);
    if (!values.length) { setError("Keywords must be at least 2 characters."); return; }

    const dupes = values.filter(v => keywords.some(k => k.keyword.toLowerCase() === v.toLowerCase()));
    if (dupes.length) { setError(`Already tracked: ${dupes.join(", ")}`); return; }

    setAdding(true); setError("");
    let ok = 0;

    for (const value of values) {
      try {
        const created = await addKeyword(value);
        setKeywords(prev => [created, ...prev]);
        ok++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("409") || msg.toLowerCase().includes("already")) {
          setError(`"${value}" already exists`);
        } else if (msg.includes("422")) {
          setError("Maximum 50 keywords per project reached"); break;
        } else {
          toast.error(`Failed to add "${value}"`);
        }
      }
    }

    if (ok > 0) { setInput(""); toast.success(`${ok} keyword${ok > 1 ? "s" : ""} added`); }
    setAdding(false);
  }

  async function handleToggle(kw: Keyword) {
    try {
      const updated = await toggleKeyword(kw.id, !kw.isActive);
      setKeywords(prev => prev.map(k => k.id === kw.id ? updated : k));
    } catch { toast.error("Failed to update keyword"); }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteKeyword(id);
      setKeywords(prev => prev.filter(k => k.id !== id));
      toast.success("Keyword removed");
    } catch { toast.error("Failed to delete keyword"); }
    finally { setDeletingId(null); }
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keyword Management</h1>
        <p className="text-zinc-500 mt-1 text-sm max-w-2xl">
          Keywords tell CynoGuard what to scan for on X. Adding a keyword triggers a background scan automatically.
        </p>
      </div>

      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <h3 className="text-sm font-semibold mb-1">Add Keywords</h3>
        <p className="text-xs text-zinc-500 mb-4">Separate multiple with commas. Max 50 per project.</p>
        <div className="flex gap-2">
          <Input
            placeholder='e.g. "CynoGuard, phishing, fraud"'
            value={input}
            onChange={e => { setInput(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-green-600"
          />
          <Button onClick={handleAdd} disabled={adding || !input.trim()}
            className="bg-green-600 hover:bg-green-500 text-white shrink-0">
            {adding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Add
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h3 className="text-sm font-semibold">Tracked Keywords ({keywords.length})</h3>
        </div>
        {loading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-zinc-800/50" />)}
          </div>
        ) : keywords.length === 0 ? (
          <div className="p-12 text-center text-zinc-600">
            <Inbox className="mx-auto h-6 w-6 opacity-50 mb-2" />
            <p className="text-sm">No keywords yet — add one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-500 text-xs uppercase">Keyword</TableHead>
                  <TableHead className="text-zinc-500 text-xs uppercase">Status</TableHead>
                  <TableHead className="text-zinc-500 text-xs uppercase">Mentions</TableHead>
                  <TableHead className="text-zinc-500 text-xs uppercase">Added</TableHead>
                  <TableHead className="text-right text-zinc-500 text-xs uppercase">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywords.map(kw => (
                  <TableRow key={kw.id} className="border-zinc-800 hover:bg-zinc-800/20">
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-3 w-3 text-zinc-600" />{kw.keyword}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline"
                        className={`cursor-pointer select-none text-[10px] ${kw.isActive ? "border-green-500/30 text-green-400 bg-green-500/5" : "border-zinc-700 text-zinc-500"}`}
                        onClick={() => handleToggle(kw)}>
                        {kw.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{kw.mentionCount}</TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {new Date(kw.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" disabled={deletingId === kw.id}
                        onClick={() => handleDelete(kw.id)} className="hover:bg-red-500/10 hover:text-red-400">
                        {deletingId === kw.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-zinc-500" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}