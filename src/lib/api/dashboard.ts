const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function api<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getOrgDashboard(orgId: string) {
  return api<OrgDashboard>(`/api/v1/orgs/${orgId}/dashboard`);
}

export function getProjectDashboard(projectId: string) {
  return api<ProjectDashboard>(`/api/v1/projects/${projectId}/dashboard`);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrgProject {
  id:           string;
  name:         string;
  status:       string;
  createdAt:    string;
  detections7d: number;
  mentions:     number;
}

export interface OrgDashboard {
  totalProjects:    number;
  activeProjects:   number;
  totalDetections:  number;
  totalBots:        number;
  totalMentions:    number;
  highRiskMentions: number;
  totalApiKeys:     number;
  projects:         OrgProject[];
}

export interface ProjectDashboard {
  totalDetections:  number;
  humanDetections:  number;
  botDetections:    number;
  detections24h:    number;
  botRate:          number;
  totalMentions:    number;
  newMentions:      number;
  highRiskMentions: number;
  totalApiKeys:     number;
  activeApiKeys:    number;
  mentionsByRisk:   { riskLevel: string; count: number }[];
  detectionChart:   { date: string; bots: number; humans: number }[];
  recentDetections: {
    id: string; ipAddress: string; riskLevel: string;
    action: string; isHuman: boolean; createdAt: string;
  }[];
}