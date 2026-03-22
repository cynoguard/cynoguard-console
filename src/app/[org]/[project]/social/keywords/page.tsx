import { useParams } from "next/navigation";
"use client";

import {
  addKeyword,
  deleteKeyword,
  getKeywords,
  toggleKeyword,
  type Keyword,
} from "@/services/api/social-monitoring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Hash, Inbox, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function KeywordsPage() {
  const params  = useParams();
  const project = params?.project as string;

  const [projectId,  setProjectId]  = useState<string | null>(null);
  const [keywords,   setKeywords]   = useState<Keyword[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [input,      setInput]      = useState("");
  const [adding,     setAdding]     = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error,      setError]      = useState("");

  // Resolve projectId by calling the server directly with orgId + project name
  // organizationId is always in localStorage from login — never changes per session
  useEffect(() => {
    if (!project) return;
    let cancelled = false;

    const resolve = async () => {
      // 1. Try localStorage first (fastest path)
      const cached        = localStorage.getItem("activeProjectId");
      const cachedProject = localStorage.getItem("activeProject");
      if (cached && cachedProject === project) {
        setProjectId(cached);
        return;
      }

      // 2. Fetch from server using organizationId (always set at login)
      try {
        const orgId = localStorage.getItem("organizationId");
        if (!orgId) {
          // fallback to whatever is cached
          if (cached) setProjectId(cached);
          return;
        }

        const res = await fetch(
          `https://api.cynoguard.com/api/organization/${orgId}/projects`
        );
        if (!res.ok || cancelled) return;

        const data = await res.json();
        const projects: { id: string; name: string }[] =
          data?.data?.projects?.projects ??
          data?.data?.projects ??
          [];

        const match = projects.find(
          (p) => p.name === project || p.name.toLowerCase() === project.toLowerCase()
        ) ?? projects[0];

        if (match && !cancelled) {
          localStorage.setItem("activeProject",   match.name);
          localStorage.setItem("activeProjectId", match.id);
          setProjectId(match.id);
        }
      } catch {
        // last resort fallback
        const fallback = localStorage.getItem("activeProjectId");
        if (fallback && !cancelled) setProjectId(fallback);
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [project]);

  // Load keywords once projectId is known
  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      setKeywords(await getKeywords(projectId));
    } catch (e) {
      toast.error("Failed to load keywords");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // Add keyword(s) — supports comma-separated
  async function handleAdd() {
    const values = input.split(",").map((v) => v.trim()).filter((v) => v.length >= 2);
    if (!values.length) { setError("Keywords must be at least 2 characters."); return; }
    if (!projectId)     { setError("Project not resolved yet, please wait."); return; }

    const dupes = values.filter((v) =>
      keywords.some((k) => k.keyword.toLowerCase() === v.toLowerCase())
    );
    if (dupes.length) { setError(`Already tracked: ${dupes.join(", ")}`); return; }

    setAdding(true);
    setError("");
    let ok = 0;

    for (const value of values) {
      try {
        const created = await addKeyword(projectId, value);
        setKeywords((prev) => [created, ...prev]);
        ok++;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("409") || msg.toLowerCase().includes("already")) {
          setError(`"${value}" already exists`);
        } else if (msg.includes("422")) {
          setError("Maximum 50 keywords per project reached");
          break;
        } else {
          toast.error(`Failed to add "${value}"`);
        }
      }
    }

    if (ok > 0) {
      setInput("");
      toast.success(`${ok} keyword${ok > 1 ? "s" : ""} added — scan triggered in background`);
    }
    setAdding(false);
  }

  // Toggle active/paused
  async function handleToggle(kw: Keyword) {
    if (!projectId) return;
    try {
      const updated = await toggleKeyword(projectId, kw.id, !kw.isActive);
      setKeywords((prev) => prev.map((k) => (k.id === kw.id ? updated : k)));
    } catch {
      toast.error("Failed to update keyword");
    }
  }

  // Delete keyword
  async function handleDelete(id: string) {
    if (!projectId) return;
    setDeletingId(id);
    try {
      await deleteKeyword(projectId, id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
      toast.success("Keyword removed");
    } catch {
      toast.error("Failed to delete keyword");
    } finally {
      setDeletingId(null);
    }
  }

  if (!projectId && !loading) {
    return (
      <div className="flex h-64 items-center justify-center text-zinc-500 text-sm">
        Could not resolve project. Please refresh.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Keyword Management</h1>
        <p className="text-zinc-500 mt-1 text-sm max-w-2xl">
          Keywords tell CynoGuard what to scan for across X (Twitter). Adding a keyword
          immediately triggers a background scan. Max 50 per project.
        </p>
      </div>

      {/* Add keywords */}
      <Card className="p-6 bg-zinc-900/50 border-zinc-800">
        <h3 className="text-sm font-semibold mb-1">Add Keywords</h3>
        <p className="text-xs text-zinc-500 mb-4">Separate multiple with commas. e.g. "CynoGuard, phishing, brand-name"</p>
        <div className="flex gap-2">
          <Input
            placeholder='e.g. "CynoGuard, phishing, fraud"'
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="bg-zinc-950 border-zinc-700 text-white placeholder:text-zinc-600 focus:border-green-600"
          />
          <Button
            onClick={handleAdd}
            disabled={adding || !input.trim() || !projectId}
            className="bg-green-600 hover:bg-green-500 text-white shrink-0"
          >
            {adding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
            Add
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </Card>

      {/* Keywords table */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tracked Keywords ({keywords.length})</h3>
        </div>

        {loading ? (
          <div className="space-y-2 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-zinc-800/50" />
            ))}
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
                {keywords.map((kw) => (
                  <TableRow key={kw.id} className="border-zinc-800 hover:bg-zinc-800/20">
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Hash className="h-3 w-3 text-zinc-600" />
                        {kw.keyword}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer select-none text-[10px] ${
                          kw.isActive
                            ? "border-green-500/30 text-green-400 bg-green-500/5"
                            : "border-zinc-700 text-zinc-500"
                        }`}
                        onClick={() => handleToggle(kw)}
                      >
                        {kw.isActive ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{kw.mentionCount}</TableCell>
                    <TableCell className="text-xs text-zinc-500">
                      {new Date(kw.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deletingId === kw.id}
                        onClick={() => handleDelete(kw.id)}
                        className="hover:bg-red-500/10 hover:text-red-400"
                      >
                        {deletingId === kw.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4 text-zinc-500" />}
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