const BASE = "http://localhost:4000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────


export interface OrgSettings {
  id:           string;
  name:         string;
  industry:     string | null;
  businessType: string | null;
  teamSize:     string | null;
  primaryUses:  string[];
  isOnboarded:  boolean;
  createdAt:    string;
  updatedAt:    string;
  _count:       { members: number; projects: number };
}

export interface OrgMember {
  id:   string;
  role: string;
  user: {
    id:        string;
    email:     string;
    firstName: string | null;
    lastName:  string | null;
    role:      string;
    isActive:  boolean;
    lastLogin: string | null;
    createdAt: string;
  };
}

export interface UserAccount {
  id:             string;  // OrganizationMember id
  userId:         string;  // DB user id
  organizationId: string;
  role:           string;
  user: {
    id:         string;
    email:      string;
    firstName:  string | null;
    lastName:   string | null;
    role:       string;
    isActive:   boolean;
    lastLogin:  string | null;
    createdAt:  string;
    updatedAt:  string;
    firebaseId: string;
  };
  organization: {
    id:           string;
    name:         string;
    industry:     string | null;
    businessType: string | null;
    teamSize:     string | null;
    primaryUses:  string[];
    isOnboarded:  boolean;
    createdAt:    string;
    updatedAt:    string;
  };
}



// ─── Org ──────────────────────────────────────────────────────────────────────

export const getOrgSettings  = (orgId: string) =>
  api<OrgSettings>(`/api/v1/orgs/${orgId}/settings`);

export const patchOrgSettings = (orgId: string, data: Partial<Pick<OrgSettings, "name" | "industry" | "businessType" | "teamSize">>) =>
  api<OrgSettings>(`/api/v1/orgs/${orgId}/settings`, {
    method: "PATCH",
    body:   JSON.stringify(data),
  });

export const getOrgMembers = (orgId: string) =>
  api<{ members: OrgMember[] }>(`/api/v1/orgs/${orgId}/members`).then((r) => r.members);

// ─── User ─────────────────────────────────────────────────────────────────────

export const getUserAccount = (orgId: string, firebaseId: string) =>
  api<UserAccount>(`/api/v1/orgs/${orgId}/users/${firebaseId}`);

export const patchUserAccount = (
  orgId:      string,
  firebaseId: string,
  data:       { firstName?: string; lastName?: string }
) =>
  api<{ id: string; email: string; firstName: string | null; lastName: string | null; role: string; updatedAt: string }>(
    `/api/v1/orgs/${orgId}/users/${firebaseId}`,
    { method: "PATCH", body: JSON.stringify(data) }
  );