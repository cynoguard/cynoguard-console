export type AlertSeverity = "Critical" | "High" | "Medium" | "Low";

export type AlertSentiment = "positive" | "negative" | "neutral";

export type AlertType =
  | "phishing_link"
  | "impersonation"
  | "keyword_mention";

export type Platform = "X";

export type AlertStatus = "active" | "resolved";

export interface SocialAlert {
  id: string;
  type: AlertType;
  platform: Platform;
  riskLevel: AlertSeverity;
  sentiment: AlertSentiment;
  content: string;
  author: string;
  keyword: string;
  createdAt: string;
  status: AlertStatus;
  sourceUrl?: string; // ✅ Added to fix your error
}

export interface DashboardData {
  totalMentions: number;
  mentionsToday: number;

  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };

  platformDistribution: {
    X: number;
  };

  mentionsPerDay: Array<{
    date: string;
    mentions: number;
  }>;

  recentMentions: SocialAlert[];
}