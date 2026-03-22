// ─────────────────────────────────────────────────────────────────────────────
// social-monitoring.ts  —  Clean, self-contained API layer
//
// HOW projectId WORKS:
//   Every function receives projectId as a plain argument.
//   Pages get projectId by calling the server with orgName+projectName from URL.
//   No localStorage. Works for every user, every project, any device.
//
// HOW AUTH WORKS:
//   Every request attaches Authorization: Bearer <firebase-token>
//   The server verifies it and sets request.userId so assertMember() passes.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "@/lib/firebase";

const API = "https://api.cynoguard.com";

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};

  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch { /* not signed in */ }

  // Don't send Content-Type on DELETE (no body)
  if (init?.method !== "DELETE") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers as Record<string, string> ?? {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── projectId resolver ───────────────────────────────────────────────────────
// Resolves projectId from orgName + projectName (URL params).
// Returns null if not found.

export async function resolveProjectId(
  orgName: string,
  projectName: string
): Promise<string | null> {
  try {
    const headers: Record<string, string> = {};
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Try the dedicated endpoint first
    const res = await fetch(
      `${API}/api/project-id?orgName=${encodeURIComponent(orgName)}&projectName=${encodeURIComponent(projectName)}`,
      { headers }
    );

    if (res.ok) {
      const data = await res.json();
      return data?.data?.projectId ?? null;
    }

    // Fallback: get org projects and match by name
    const orgId = localStorage.getItem("organizationId");
    if (!orgId) return localStorage.getItem("activeProjectId");

    const r2 = await fetch(`${API}/api/organization/${orgId}/projects`, { headers });
    if (!r2.ok) return localStorage.getItem("activeProjectId");

    const d2 = await r2.json();
    const projects: { id: string; name: string }[] =
      d2?.data?.projects?.projects ?? d2?.data?.projects ?? [];

    const match = projects.find(
      (p) => p.name === projectName || p.name === projectName.toLowerCase()
    );

    if (match) {
      localStorage.setItem("activeProject",   match.name);
      localStorage.setItem("activeProjectId", match.id);
      return match.id;
    }

    return localStorage.getItem("activeProjectId");
  } catch {
    return localStorage.getItem("activeProjectId");
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type RiskLevel     = "LOW" | "MEDIUM" | "HIGH";
export type Sentiment     = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
export type MentionStatus = "NEW" | "VIEWED" | "DISMISSED" | "ARCHIVED";

export interface Keyword {
  id:           string;
  projectId:    string;
  keyword:      string;
  isActive:     boolean;
  mentionCount: number;
  createdAt:    string;
}

export interface BrandMention {
  id:             string;
  projectId:      string;
  platform:       "X";
  externalId:     string;
  content:        string;
  authorUsername: string;
  authorId:       string;
  tweetUrl:       string | null;
  likeCount:      number;
  retweetCount:   number;
  riskScore:      number;
  riskLevel:      RiskLevel;
  riskFlags:      string[];
  status:         MentionStatus;
  sentiment:      Sentiment;
  matchedKeyword: string | null;
  publishedAt:    string | null;
  scannedAt:      string;
}

export interface MentionStats {
  byRisk:           { riskLevel: RiskLevel;  _count: number }[];
  bySentiment:      { sentiment: Sentiment;  _count: number }[];
  byStatus:         { status: MentionStatus; _count: number }[];
  mentionsToday:    number;
  mentionsOverTime: { date: string; count: number }[];
  recentScans:      {
    id:            string;
    scanStatus:    string;
    mentionsFound: number;
    highRiskCount: number;
    scannedAt:     string;
  }[];
}

export interface PaginatedMentions {
  data:       BrandMention[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Keywords API ─────────────────────────────────────────────────────────────

export const getKeywords = (projectId: string) =>
  call<{ keywords: Keyword[] }>(`/api/v1/projects/${projectId}/keywords`)
    .then((r) => r.keywords);

export const addKeyword = (projectId: string, keyword: string) =>
  call<Keyword>(`/api/v1/projects/${projectId}/keywords`, {
    method: "POST",
    body:   JSON.stringify({ keyword }),
  });

export const toggleKeyword = (projectId: string, keywordId: string, isActive: boolean) =>
  call<Keyword>(`/api/v1/projects/${projectId}/keywords/${keywordId}`, {
    method: "PATCH",
    body:   JSON.stringify({ isActive }),
  });

export const deleteKeyword = (projectId: string, keywordId: string) =>
  call<void>(`/api/v1/projects/${projectId}/keywords/${keywordId}`, {
    method: "DELETE",
  });

// ─── Mentions API ─────────────────────────────────────────────────────────────

export interface MentionFilters {
  page?:      number;
  limit?:     number;
  status?:    MentionStatus;
  riskLevel?: RiskLevel;
  sentiment?: Sentiment;
}

export const getMentions = (projectId: string, filters: MentionFilters = {}) => {
  const qs = new URLSearchParams();
  if (filters.page)      qs.set("page",      String(filters.page));
  if (filters.limit)     qs.set("limit",     String(filters.limit));
  if (filters.status)    qs.set("status",    filters.status);
  if (filters.riskLevel) qs.set("riskLevel", filters.riskLevel);
  if (filters.sentiment) qs.set("sentiment", filters.sentiment);
  return call<PaginatedMentions>(
    `/api/v1/projects/${projectId}/mentions?${qs.toString()}`
  );
};

export const getMentionStats = (projectId: string) =>
  call<MentionStats>(`/api/v1/projects/${projectId}/mentions/stats`);

export const resolveMention = (projectId: string, mentionId: string) =>
  call<BrandMention>(`/api/v1/projects/${projectId}/mentions/${mentionId}`, {
    method: "PATCH",
    body:   JSON.stringify({ status: "DISMISSED" }),
  });

export const triggerScan = (projectId: string) =>
  call<{ message: string; mentionsFound: number; highRiskCount: number; newMentions: number }>(
    `/api/v1/projects/${projectId}/mentions/scan`,
    { method: "POST" }
  );