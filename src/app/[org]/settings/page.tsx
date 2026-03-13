"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getOrgMembers, getOrgSettings, patchOrgSettings, type OrgMember, type OrgSettings } from "@/lib/api/settings";
import { Building2, Calendar, Loader2, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "E-commerce", "Education", "Media", "Other"];
const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

export default function SettingsPage() {
  const { toast } = useToast();

  const [org,         setOrg]         = useState<OrgSettings | null>(null);
  const [members,     setMembers]     = useState<OrgMember[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);

  // Form state
  const [name,         setName]         = useState("");
  const [industry,     setIndustry]     = useState("");
  const [businessType, setBusinessType] = useState("");
  const [teamSize,     setTeamSize]     = useState("");

  useEffect(() => {
    const orgId = localStorage.getItem("organizationId");
    if (!orgId) return;

    Promise.all([getOrgSettings(orgId), getOrgMembers(orgId)])
      .then(([orgData, memberData]) => {
        setOrg(orgData);
        setMembers(memberData);
        setName(orgData.name);
        setIndustry(orgData.industry     ?? "");
        setBusinessType(orgData.businessType ?? "");
        setTeamSize(orgData.teamSize     ?? "");
      })
      .catch(() => toast({ title: "Error", description: "Failed to load settings.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleSave() {
    const orgId = localStorage.getItem("organizationId");
    if (!orgId || !org) return;

    setSaving(true);
    try {
      const updated = await patchOrgSettings(orgId, {
        name:         name.trim()        || undefined,
        industry:     industry           || undefined,
        businessType: businessType       || undefined,
        teamSize:     teamSize           || undefined,
      });
      setOrg(updated);
      toast({ title: "Saved", description: "Organisation settings updated." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const isDirty =
    name         !== (org?.name         ?? "") ||
    industry     !== (org?.industry     ?? "") ||
    businessType !== (org?.businessType ?? "") ||
    teamSize     !== (org?.teamSize     ?? "");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organisation Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organisation profile and team members.
        </p>
      </div>

      {/* Org Info Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Building2 className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Organisation Profile</h2>
            <p className="text-xs text-zinc-500">Update your organisation details</p>
          </div>
          {loading ? null : (
            <div className="ml-auto flex gap-3 text-xs text-zinc-500">
              <span>{org?._count.projects ?? 0} projects</span>
              <span>{org?._count.members  ?? 0} members</span>
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organisation Name</Label>
                  <Input
                    id="org-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <Input
                    id="business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    placeholder="e.g. SaaS, Agency, Enterprise"
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Team Size</Label>
                  <Select value={teamSize} onValueChange={setTeamSize}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAM_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="h-3.5 w-3.5" />
                  Created {org?.createdAt
                    ? new Date(org.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "—"}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  size="sm"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Members Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Team Members</h2>
            <p className="text-xs text-zinc-500">People with access to this organisation</p>
          </div>
          <Badge variant="outline" className="ml-auto border-zinc-700 text-zinc-400 text-xs">
            {members.length} {members.length === 1 ? "member" : "members"}
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-px">
            {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse bg-zinc-900/30 border-b border-zinc-800 last:border-0" />)}
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">No members found.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/20 transition-colors">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-300">
                  {m.user.firstName?.slice(0, 1).toUpperCase() ?? m.user.email.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {m.user.firstName && m.user.lastName
                      ? `${m.user.firstName} ${m.user.lastName}`
                      : m.user.email}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{m.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={m.role === "OWNER"
                      ? "border-blue-500/40 text-blue-400"
                      : "border-zinc-700 text-zinc-400"}
                  >
                    {m.role}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={m.user.isActive
                      ? "border-green-500/40 text-green-400"
                      : "border-zinc-700 text-zinc-500"}
                  >
                    {m.user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-600 hidden md:block">
                  {m.user.lastLogin
                    ? `Last seen ${new Date(m.user.lastLogin).toLocaleDateString()}`
                    : "Never signed in"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="bg-zinc-900/50 border-red-500/20 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-red-500/20 px-6 py-4">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Shield className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
            <p className="text-xs text-zinc-500">Irreversible actions — proceed with caution</p>
          </div>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Organisation</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Permanently delete this organisation and all its projects and data.
            </p>
          </div>
          <Button variant="destructive" size="sm" disabled>
            Delete Organisation
          </Button>
        </div>
      </Card>

    </div>
  );
}