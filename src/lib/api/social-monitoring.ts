// lib/api/social-monitoring.ts
// Mirrors bot-management.ts exactly — reads activeProjectId from localStorage,
// attaches Firebase token for auth. Works for every user, every project.

import { auth } from "@/lib/firebase";

const BASE = "https://api.cynoguard.com";

export const getActiveProjectId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeProjectId");
};

async function getToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (user) return await user.getIdToken();
    return null;
  } catch {
    return null;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  // Only send Content-Type if there is actually a body
  const hasBody = !!init?.body;
  const headers: Record<string, string> = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${BASE}${path}`, {
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

// ─── Types ────────────────────────────────────────────

export type RiskLevel     = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Sentiment     = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
export type MentionStatus = "NEW" | "VIEWED" | "DISMISSED" | "ARCHIVED";

export interface Keyword {
  id: string; projectId: string; keyword: string;
  isActive: boolean; mentionCount: number; createdAt: string;
}

export interface BrandMention {
  id: string; projectId: string; platform: "X"; externalId: string;
  content: string; authorUsername: string; authorId: string;
  tweetUrl: string | null; likeCount: number; retweetCount: number;
  riskScore: number; riskLevel: RiskLevel; riskFlags: string[];
  status: MentionStatus; sentiment: Sentiment; matchedKeyword: string | null;
  publishedAt: string | null; scannedAt: string;
}

export interface MentionStats {
  byRisk:           { riskLevel: RiskLevel;  _count: number }[];
  bySentiment:      { sentiment: Sentiment;  _count: number }[];
  byStatus:         { status: MentionStatus; _count: number }[];
  mentionsToday:    number;
  mentionsOverTime: { date: string; count: number }[];
  recentScans:      { id: string; scanStatus: string; mentionsFound: number; highRiskCount: number; scannedAt: string }[];
}

export interface PaginatedMentions {
  data: BrandMention[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface MentionFilters {
  page?: number; limit?: number;
  status?: MentionStatus; riskLevel?: RiskLevel; sentiment?: Sentiment;
}

// ─── Keywords ─────────────────────────────────────────

export const fetchKeywords = () => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<{ keywords: Keyword[] }>(`/api/v1/projects/${pid}/keywords`)
    .then(r => r.keywords);
};

export const addKeyword = (keyword: string) => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<Keyword>(`/api/v1/projects/${pid}/keywords`, {
    method: "POST", body: JSON.stringify({ keyword }),
  });
};

export const toggleKeyword = (keywordId: string, isActive: boolean) => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<Keyword>(`/api/v1/projects/${pid}/keywords/${keywordId}`, {
    method: "PATCH", body: JSON.stringify({ isActive }),
  });
};

export const deleteKeyword = (keywordId: string) => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<void>(`/api/v1/projects/${pid}/keywords/${keywordId}`, {
    method: "DELETE",
  });
};

// ─── Mentions ─────────────────────────────────────────

export const fetchMentionStats = () => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<MentionStats>(`/api/v1/projects/${pid}/mentions/stats`);
};

export const fetchMentions = (filters: MentionFilters = {}) => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  const qs = new URLSearchParams();
  if (filters.page)      qs.set("page",      String(filters.page));
  if (filters.limit)     qs.set("limit",     String(filters.limit));
  if (filters.status)    qs.set("status",    filters.status);
  if (filters.riskLevel) qs.set("riskLevel", filters.riskLevel);
  if (filters.sentiment) qs.set("sentiment", filters.sentiment);
  return apiFetch<PaginatedMentions>(
    `/api/v1/projects/${pid}/mentions?${qs.toString()}`
  );
};

export const resolveMention = (mentionId: string) => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<BrandMention>(`/api/v1/projects/${pid}/mentions/${mentionId}`, {
    method: "PATCH", body: JSON.stringify({ status: "DISMISSED" }),
  });
};

export const getMentionDetail = (mentionId: string) => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<BrandMention>(`/api/v1/projects/${pid}/mentions/${mentionId}`);
};

export const updateMentionStatus = (mentionId: string, status: MentionStatus) => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<BrandMention>(`/api/v1/projects/${pid}/mentions/${mentionId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const triggerScan = () => {
  const pid = getActiveProjectId();
  if (!pid) return Promise.reject(new Error("No active project"));
  return apiFetch<{ message: string; mentionsFound: number; highRiskCount: number; newMentions: number }>(
    `/api/v1/projects/${pid}/mentions/scan`, { method: "POST" }
  );
};