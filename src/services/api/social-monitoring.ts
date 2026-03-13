import { getActiveProjectId } from "@/lib/api/bot-management";

// src/services/api/social-monitoring.ts
const BASE = "http://localhost:4000";

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
  recentScans:      { id: string; scanStatus: string; mentionsFound: number; highRiskCount: number; scannedAt: string }[];
}

export interface PaginatedMentions {
  data:       BrandMention[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ScanResult {
  message:       string;
  mentionsFound: number;
  highRiskCount: number;
  newMentions:   number;
}

export interface DashboardData {
  totalMentions:    number;
  mentionsToday:    number;
  highRiskCount:    number;
  newCount:         number;
  sentimentData:    { name: string; value: number; color: string }[];
  mentionsOverTime: { date: string; count: number }[];
  recentScans:      MentionStats["recentScans"];
}

export interface SocialAlert {
  id:             string;
  platform:       "X";
  authorUsername: string;
  content:        string;
  riskLevel:      RiskLevel;
  sentiment:      Sentiment;
  status:         MentionStatus;
  matchedKeyword: string | null;
  tweetUrl:       string | null;
  publishedAt:    string | null;
  scannedAt:      string;
}

// ─── Transform helpers ────────────────────────────────────────────────────────

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  POSITIVE: "#22c55e",
  NEUTRAL:  "#71717a",
  NEGATIVE: "#ef4444",
};

export function statsToDashboardData(stats: MentionStats): DashboardData {
  const totalMentions = stats.byStatus.reduce((s, r) => s + r._count, 0);
  const highRiskCount = stats.byRisk.find((r) => r.riskLevel === "HIGH")?._count ?? 0;
  const newCount      = stats.byStatus.find((r) => r.status === "NEW")?._count ?? 0;
  const sentimentData = stats.bySentiment.map((r) => ({
    name:  r.sentiment.charAt(0) + r.sentiment.slice(1).toLowerCase(),
    value: r._count,
    color: SENTIMENT_COLORS[r.sentiment],
  }));
  return { totalMentions, mentionsToday: stats.mentionsToday, highRiskCount, newCount, sentimentData, mentionsOverTime: stats.mentionsOverTime, recentScans: stats.recentScans };
}

export function mentionToAlert(m: BrandMention): SocialAlert {
  return { id: m.id, platform: m.platform, authorUsername: m.authorUsername, content: m.content, riskLevel: m.riskLevel, sentiment: m.sentiment, status: m.status, matchedKeyword: m.matchedKeyword, tweetUrl: m.tweetUrl, publishedAt: m.publishedAt, scannedAt: m.scannedAt };
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

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
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Keywords ─────────────────────────────────────────────────────────────────

export const getKeywords = (projectId: string) =>
  api<{ keywords: Keyword[] }>(`/api/v1/projects/${projectId}/keywords`).then((r) => r.keywords);

export const createKeyword = (projectId: string, keyword: string) =>
  api<Keyword>(`/api/v1/projects/${projectId}/keywords`, {
    method: "POST",
    body:   JSON.stringify({ keyword }),
  });

export const patchKeyword = (projectId: string, keywordId: string, isActive: boolean) =>
  api<Keyword>(`/api/v1/projects/${projectId}/keywords/${keywordId}`, {
    method: "PATCH",
    body:   JSON.stringify({ isActive }),
  });

export const removeKeyword = (projectId: string, keywordId: string) =>
  api<void>(`/api/v1/projects/${projectId}/keywords/${keywordId}`, { method: "DELETE" });

// ─── Mentions ─────────────────────────────────────────────────────────────────

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
  return api<PaginatedMentions>(`/api/v1/projects/${projectId}/mentions?${qs}`);
};

export const getMentionStats = (projectId: string) =>
  api<MentionStats>(`/api/v1/projects/${projectId}/mentions/stats`);

export const patchMention = (projectId: string, mentionId: string, status: MentionStatus) =>
  api<BrandMention>(`/api/v1/projects/${projectId}/mentions/${mentionId}`, {
    method: "PATCH",
    body:   JSON.stringify({ status }),
  });

export const runScan = (projectId: string) =>
  api<ScanResult>(`/api/v1/projects/${projectId}/mentions/scan`, { method: "POST" });


// ─── Aliases (read projectId from active project in localStorage) ─────────────

export const fetchStats    = () => getMentionStats(getActiveProjectId() || "" );
export const fetchMentions = (filters: MentionFilters = {}) => getMentions(getActiveProjectId() || "", filters);
export const updateMentionStatus = (mentionId: string, status: MentionStatus) =>
  patchMention(getActiveProjectId() || "", mentionId, status);