/* ── Social Alert (Mention) types ── */

export type AlertType =
  | "keyword_mention"
  | "phishing_link"
  | "impersonation"

export type Platform =
  | "X"
  | "REDDIT"
  | "OTHER"

export type Sentiment =
  | "positive"
  | "neutral"
  | "negative"

export type RiskLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Critical"

export type AlertStatus =
  | "active"
  | "resolved"

export interface SocialAlert {
  id: string
  type: AlertType
  platform: Platform
  keyword: string
  content: string
  sentiment: Sentiment
  riskLevel: RiskLevel
  createdAt: string
  status: AlertStatus
  sourceUrl?: string
  author?: string
}

/* ── Dashboard API response ── */

export interface DashboardData {
  totalMentions: number
  mentionsToday: number
  sentiment: {
    positive: number
    neutral: number
    negative: number
  }
  platformDistribution: Record<Platform, number>
  mentionsPerDay: {
    date: string
    count: number
  }[]
  recentMentions: SocialAlert[]
}

/* ── Keyword types ── */

export interface Keyword {
  id: string
  projectId: string
  value: string
  isActive: boolean
  createdAt: string
  mentionCount?: number
}