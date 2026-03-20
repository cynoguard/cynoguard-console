"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getUserAccount, patchUserAccount, type UserAccount } from "@/lib/api/settings";
import { RootState } from "@/store";
import { setAuth } from "@/store/authSlice";
import { Building2, Calendar, Loader2, Mail, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AccountPage() {
  const { toast } = useToast();
  const dispatch  = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const [member,    setMember]    = useState<UserAccount | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");

  useEffect(() => {
    const firebaseId = localStorage.getItem("authId");
    const orgId      = localStorage.getItem("organizationId");
    if (!firebaseId || !orgId) return;

    getUserAccount(orgId, firebaseId)
      .then((data) => {
        setMember(data);
        setFirstName(data.user.firstName ?? "");
        setLastName(data.user.lastName   ?? "");
      })
      .catch(() => toast({ title: "Error", description: "Failed to load account.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  async function handleSave() {
    const firebaseId = localStorage.getItem("authId");
    const orgId      = localStorage.getItem("organizationId");
    if (!firebaseId || !orgId || !member) return;

    setSaving(true);
    try {
      const updated = await patchUserAccount(orgId, firebaseId, {
        firstName: firstName.trim() || undefined,
        lastName:  lastName.trim()  || undefined,
      });
      setMember((prev) => prev ? { ...prev, user: { ...prev.user, ...updated } } : prev);
      // Sync Redux — spread existing authState to satisfy AuthState shape
      dispatch(setAuth({
        ...authState,
        firstName: updated.firstName,
        lastName:  updated.lastName,
      }));
      toast({ title: "Saved", description: "Your profile has been updated." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const isDirty =
    firstName !== (member?.user.firstName ?? "") ||
    lastName  !== (member?.user.lastName  ?? "");

  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : member?.user.email?.slice(0, 2).toUpperCase() ?? "??";

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "border-red-500/40 text-red-400",
    ADMIN:       "border-yellow-500/40 text-yellow-400",
    MEMBER:      "border-zinc-700 text-zinc-400",
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1">Manage your personal profile and account settings.</p>
      </div>

      {/* Profile Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-4">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <User className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Personal Information</h2>
            <p className="text-xs text-zinc-500">Update your name and profile details</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-xl font-bold text-zinc-200">
                  {initials}
                </div>
                <div>
                  <p className="text-base font-semibold">
                    {member?.user.firstName && member?.user.lastName
                      ? `${member.user.firstName} ${member.user.lastName}`
                      : member?.user.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={roleColors[member?.user.role ?? "MEMBER"] ?? roleColors.MEMBER}>
                      {member?.user.role}
                    </Badge>
                    <Badge variant="outline" className={member?.role === "OWNER" ? "border-blue-500/40 text-blue-400" : "border-zinc-700 text-zinc-400"}>
                      {member?.role}
                    </Badge>
                    <Badge variant="outline" className={member?.user.isActive ? "border-green-500/40 text-green-400" : "border-zinc-700 text-zinc-500"}>
                      {member?.user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input
                    id="first-name" value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input
                    id="last-name" value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Email</p>
                    <p className="text-sm text-zinc-300 truncate">{member?.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                  <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Member Since</p>
                    <p className="text-sm text-zinc-300">
                      {member?.user.createdAt
                        ? new Date(member.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving || !isDirty} size="sm">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Organisation Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-4">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Building2 className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Organisation</h2>
            <p className="text-xs text-zinc-500">Your current organisation membership</p>
          </div>
        </div>

        {loading ? (
          <div className="h-16 animate-pulse bg-zinc-900/30" />
        ) : (
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-sm font-semibold text-zinc-300">
              {member?.organization.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium capitalize">{member?.organization.name}</p>
              <p className="text-xs text-zinc-500">{member?.organization.industry ?? "No industry set"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={member?.role === "OWNER" ? "border-blue-500/40 text-blue-400" : "border-zinc-700 text-zinc-400"}>
                {member?.role}
              </Badge>
              {member?.organization.teamSize && (
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {member.organization.teamSize} people
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Security Card */}
      <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-6 py-4">
          <div className="p-2 rounded-lg bg-green-500/10">
            <ShieldCheck className="h-4 w-4 text-green-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Security</h2>
            <p className="text-xs text-zinc-500">Authentication managed via Firebase</p>
          </div>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Password & Authentication</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Password changes and MFA are managed through your identity provider.
            </p>
          </div>
          <Badge variant="outline" className="border-green-500/40 text-green-400">Firebase Auth</Badge>
        </div>
      </Card>

    </div>
  );
}