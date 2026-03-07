// ─────────────────────────────────────────────────────────────────
// social-monitoring.ts
// Typed API functions for all social monitoring endpoints.
// All calls go through Next.js /api/social-monitoring/* proxy routes
// which forward to the Fastify backend.
// ─────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
export type MentionStatus = "NEW" | "VIEWED" | "DISMISSED" | "ARCHIVED";

export interface BrandMention {
  id: string;
  projectId: string;
  platform: string;
  externalId: string;
  content: string;
  authorUsername: string;
  authorId: string;
  tweetUrl: string | null;
  likeCount: number;
  retweetCount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFlags: string[];
  sentiment: Sentiment;
  matchedKeyword: string | null;
  status: MentionStatus;
  publishedAt: string | null;
  scannedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendKeyword {
  id: string;
  projectId: string;
  keyword: string;
  isActive: boolean;
  mentionCount: number;
  createdAt: string;
}

export interface StatsResponse {
  byRisk: { riskLevel: RiskLevel; _count: number }[];
  bySentiment: { sentiment: Sentiment; _count: number }[];
  byStatus: { status: MentionStatus; _count: number }[];
  mentionsToday: number;
  mentionsOverTime: { date: string; count: number }[];
  recentScans: {
    id: string;
    scanStatus: string;
    mentionsFound: number;
    highRiskCount: number;
    scannedAt: string;
  }[];
}

export interface MentionsResponse {
  data: BrandMention[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ScanResult {
  message: string;
  projectId: string;
  mentionsFound: number;
  newMentions: number;
  highRiskCount: number;
  error: string | null;
}

// ── API Helpers ───────────────────────────────────────────────────

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${url} failed: ${res.status}`);
  return res.json();
}

async function del(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok && res.status !== 204) throw new Error(`DELETE ${url} failed: ${res.status}`);
}

// ── Public API Functions ──────────────────────────────────────────

/** Fetch dashboard stats — used by social/page.tsx */
export async function fetchStats(): Promise<StatsResponse> {
  return get<StatsResponse>("/api/social-monitoring/stats");
}

/** Fetch paginated mentions — used by social/feed/page.tsx */
export async function fetchMentions(params?: {
  page?: number;
  limit?: number;
  riskLevel?: RiskLevel;
  status?: MentionStatus;
  sentiment?: Sentiment;
}): Promise<MentionsResponse> {
  const qs = new URLSearchParams();
  if (params?.page)      qs.set("page", String(params.page));
  if (params?.limit)     qs.set("limit", String(params.limit));
  if (params?.riskLevel) qs.set("riskLevel", params.riskLevel);
  if (params?.status)    qs.set("status", params.status);
  if (params?.sentiment) qs.set("sentiment", params.sentiment);
  return get<MentionsResponse>(`/api/social-monitoring/mentions?${qs}`);
}

/** Update a mention's status (resolve/dismiss/archive) */
export async function updateMentionStatus(
  mentionId: string,
  status: MentionStatus
): Promise<BrandMention> {
  return patch<BrandMention>(`/api/social-monitoring/mentions/${mentionId}`, { status });
}

/** Trigger a manual scan */
export async function triggerScan(): Promise<ScanResult> {
  return post<ScanResult>("/api/social-monitoring/scan");
}

/** Fetch all keywords with mention counts */
export async function fetchKeywords(): Promise<BackendKeyword[]> {
  const data = await get<{ keywords: BackendKeyword[] }>("/api/social-monitoring/keywords");
  return data.keywords;
}

/** Add a new keyword */
export async function addKeyword(keyword: string): Promise<BackendKeyword> {
  return post<BackendKeyword>("/api/social-monitoring/keywords", { keyword });
}

/** Delete a keyword */
export async function deleteKeyword(keywordId: string): Promise<void> {
  return del(`/api/social-monitoring/keywords/${keywordId}`);
}

/** Toggle keyword active/inactive */
export async function toggleKeyword(
  keywordId: string,
  isActive: boolean
): Promise<BackendKeyword> {
  return patch<BackendKeyword>(`/api/social-monitoring/keywords/${keywordId}`, { isActive });
}

// ── Data Mappers ──────────────────────────────────────────────────
// Convert backend format → frontend SocialAlert format

import type { SocialAlert } from "@/lib/types/social-alert";

function getRiskLevelDisplay(level: RiskLevel): "Critical" | "High" | "Medium" | "Low" {
  const map: Record<RiskLevel, "Critical" | "High" | "Medium" | "Low"> = {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  };
  return map[level];
}

function getSentimentDisplay(s: Sentiment): "positive" | "negative" | "neutral" {
  return s.toLowerCase() as "positive" | "negative" | "neutral";
}

function getAlertType(flags: string[]): "phishing_link" | "impersonation" | "keyword_mention" {
  const joined = flags.join(" ").toLowerCase();
  if (joined.includes("suspicious_link") || joined.includes("phishing")) return "phishing_link";
  if (joined.includes("impersonat") || joined.includes("fake account")) return "impersonation";
  return "keyword_mention";
}

function getAlertStatus(status: MentionStatus): "active" | "resolved" {
  return status === "DISMISSED" || status === "ARCHIVED" ? "resolved" : "active";
}

export function mentionToAlert(m: BrandMention): SocialAlert {
  return {
    id: m.id,
    type: getAlertType(m.riskFlags),
    platform: m.platform as "X",
    riskLevel: getRiskLevelDisplay(m.riskLevel),
    sentiment: getSentimentDisplay(m.sentiment),
    content: m.content,
    author: `@${m.authorUsername}`,
    keyword: m.matchedKeyword ?? "",
    createdAt: m.publishedAt
      ? new Date(m.publishedAt).toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : new Date(m.scannedAt).toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
    status: getAlertStatus(m.status),
    sourceUrl: m.tweetUrl ?? undefined,
  };
}

/** Convert backend stats → DashboardData shape expected by KpiCards / charts */
export function statsToDashboardData(stats: StatsResponse) {
  const totalMentions = stats.byStatus.reduce((sum, s) => sum + s._count, 0);

  const sentimentMap: Record<string, number> = {};
  for (const s of stats.bySentiment) {
    sentimentMap[s.sentiment] = s._count;
  }

  return {
    totalMentions,
    mentionsToday: stats.mentionsToday,
    sentiment: {
      positive: sentimentMap["POSITIVE"] ?? 0,
      negative: sentimentMap["NEGATIVE"] ?? 0,
      neutral:  sentimentMap["NEUTRAL"]  ?? 0,
    },
    platformDistribution: { X: totalMentions },
    mentionsPerDay: stats.mentionsOverTime.map((d) => ({
      date: d.date,
      mentions: d.count,
    })),
    recentMentions: [], // filled separately by fetching mentions
  };
}

/** Convert backend keyword → frontend Keyword shape */
export function toFrontendKeyword(k: BackendKeyword) {
  return {
    id: k.id,
    value: k.keyword,
    isActive: k.isActive,
    mentionCount: k.mentionCount,
    createdAt: k.createdAt,
  };
}