/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import axios from "axios";
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  Key,
  Loader2,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  Trash2,
  Zap
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  createdAt: string;
  status: string;
  connectionVerified: boolean;
  projectId: string;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const { org, project } = useParams() as { org: string; project: string };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeysList, setApiKeysList] = useState<ApiKey[]>([]);

  const projectId = typeof window !== 'undefined' ? localStorage.getItem("activeProjectId") : null;

  // Reusable Fetch Helper
  const fetchApiKeys = useCallback(async () => {
    if (!projectId) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`https://api.cynoguard.com/api/bot-dtection/api-keys/${projectId}/list`);
      if (response.data.status === "success") {
        setApiKeysList(response.data.data);
        console.log(apiKeysList)
      } else {
        toast.error(response.data.message || "Failed to fetch API keys");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Internal Server Error while fetching keys");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return toast.error("Please enter a key name");

    setIsCreating(true);
    try {
      const response = await axios.post("https://api.cynoguard.com/api/bot-dtection/api-key", {
        projectId,
        name: newKeyName,
      });

      if (response.data.status === "success") {
        toast.success(`Key "${newKeyName}" created`);

        // Store the one-time API key before navigating
        const apiKeyValue = response.data.data?.api_key;
        const keyId       = response.data.data?.id;

        if (apiKeyValue) {
          sessionStorage.setItem("onetime-api-key", apiKeyValue);
        }

        setIsDialogOpen(false);
        setNewKeyName("");

        if (!keyId) {
          // id missing — refresh list instead of navigating to a broken URL
          console.error("API key created but id is missing from response:", response.data);
          toast.error("Key created but setup page unavailable — please use View Setup from the table.");
          fetchApiKeys();
          return;
        }

        router.push(`/${org}/${project}/bots/${keyId}/setup`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async () => {
    if (!selectedKey) return;
    setIsRevoking(true);
    try {
      const response = await axios.delete(`https://api.cynoguard.com/api/bot-dtection/api-keys/${selectedKey.id}`);
      if (response.data.status === "success") {
        toast.success("API Key revoked successfully");
        setIsRevokeOpen(false);
        fetchApiKeys(); // Refresh list
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke key");
    } finally {
      setIsRevoking(false);
      setSelectedKey(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#09090b] text-zinc-100 p-8 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
            <Zap className="h-3 w-3" />
            Bot Detection Engine
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
        </div>

        {apiKeysList.length > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-zinc-100 text-black hover:bg-zinc-200 rounded-md px-6 font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Create New Key
              </Button>
            </DialogTrigger>
            <CreateKeyModal 
              newKeyName={newKeyName} 
              setNewKeyName={setNewKeyName} 
              handleCreateKey={handleCreateKey} 
              isCreating={isCreating} 
            />
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-700" />
        </div>
      ) : apiKeysList.length === 0 ? (
        <Card className="bg-zinc-900/20 border-zinc-800 border-dashed py-20 flex flex-col items-center justify-center text-center">
          <div className="bg-zinc-800/50 p-4 rounded-full mb-4">
            <Key className="h-8 w-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-medium mb-2">No API Keys found</h2>
          <p className="text-zinc-500 text-sm max-w-sm mb-8">
            Create your first key to start protecting your application.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-zinc-100 text-black hover:bg-zinc-200 font-bold px-8">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Key
              </Button>
            </DialogTrigger>
            <CreateKeyModal 
              newKeyName={newKeyName} 
              setNewKeyName={setNewKeyName} 
              handleCreateKey={handleCreateKey} 
              isCreating={isCreating} 
            />
          </Dialog>
        </Card>
      ) : (
        <Card className="bg-[#09090b] border-zinc-800 rounded-md overflow-hidden shadow-none">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-400 text-xs font-bold uppercase py-4">Key Name</TableHead>
                <TableHead className="text-zinc-400 text-xs font-bold uppercase py-4">Key Hash (ID)</TableHead>
                <TableHead className="text-zinc-400 text-xs font-bold uppercase py-4">Status</TableHead>
                <TableHead className="text-zinc-400 text-xs font-bold uppercase py-4">Created At</TableHead>
                <TableHead className="text-right text-zinc-400 text-xs font-bold uppercase py-4 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeysList.map((apiKey) => (
                <TableRow key={apiKey.id} className="border-zinc-800 hover:bg-zinc-900/20 transition-colors">
                  <TableCell className="font-medium text-sm py-4">{apiKey.name}</TableCell>
                  <TableCell className="py-4">
                    <div 
                      className="flex items-center gap-2 group cursor-pointer w-fit" 
                      onClick={() => {
                        navigator.clipboard.writeText(apiKey.keyHash);
                        toast.success("Hash copied");
                      }}
                    >
                      <code className="bg-zinc-950 px-2.5 py-1 rounded-[4px] text-zinc-500 font-mono text-[10px] border border-zinc-800">
                        {apiKey.keyHash.substring(0, 12)}...
                      </code>
                      <Copy className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100" />
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {apiKey.connectionVerified ? (
                      <Badge className="bg-green-500/5 text-green-500 border-green-500/20 rounded-[4px] text-[10px] uppercase">Connected</Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/5 rounded-[4px] text-[10px] uppercase">{apiKey.status}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs py-4">{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right py-4 pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-800 rounded-md">
                          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100">
                        <DropdownMenuItem onClick={() => {
                            if (!apiKey.id) { toast.error("Key ID missing"); return; }
                            router.push(`/${org}/${project}/bots/${apiKey.id}/setup`);
                          }} className="gap-2 text-xs cursor-pointer">
                          <ExternalLink className="h-3.5 w-3.5" /> View Setup
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedKey(apiKey);
                            setIsRevokeOpen(true);
                          }}
                          className="gap-2 text-xs text-red-400 focus:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Revoke Key
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Revoke Warning Dialog */}
      <Dialog open={isRevokeOpen} onOpenChange={setIsRevokeOpen}>
        <DialogContent className="bg-[#09090b] border-zinc-800 text-zinc-100 sm:max-w-[400px]">
          <DialogHeader className="items-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <DialogTitle className="text-xl">Revoke API Key</DialogTitle>
            <DialogDescription className="text-zinc-500 text-sm">
              Are you sure you want to revoke <span className="text-zinc-200 font-bold">&quot;{selectedKey?.name}&quot;</span>? 
              This action is permanent and will immediately stop all bot detection traffic using this key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className=" flex flex-col gap-2 mt-4">
            <div className="flex flex-col w-full gap-2">
<Button variant="ghost" onClick={() => setIsRevokeOpen(false)} className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancel
            </Button>
            <Button 
              onClick={handleRevokeKey} 
              disabled={isRevoking}
              className="w-full bg-red-600 text-white hover:bg-red-700 font-bold"
            >
              {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Revoke Permanently"}
            </Button>
            </div>
            
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="text-[11px] text-zinc-600 flex items-center justify-center gap-2">
        <ShieldAlert className="h-3 w-3" />
        Keys marked as &apos;Pending&apos; will automatically expire if no signals are received within 24 hours.
      </div>
    </div>
  );
}

function CreateKeyModal({ newKeyName, setNewKeyName, handleCreateKey, isCreating }: any) {
  return (
    <DialogContent className="bg-[#09090b] border-zinc-800 text-zinc-100 sm:max-w-[425px]">
      <form onSubmit={handleCreateKey}>
        <DialogHeader>
          <DialogTitle className="text-xl">Create API Key</DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs">
            Give your new key a name to identify it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Key Name</Label>
            <Input
              id="name"
              placeholder="e.g. Mobile App Production"
              className="bg-zinc-950 border-zinc-800 focus:border-zinc-600"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" disabled={isCreating} className="w-full bg-zinc-100 text-black hover:bg-zinc-200 font-bold">
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate & Continue"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}