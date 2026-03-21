/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE = "https://api.cynoguard.com";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function ctx() {
  const orgId     = localStorage.getItem("organizationId");
  const projectId = localStorage.getItem("activeProjectId");
  if (!orgId || !projectId) throw new Error("No active org/project");
  return { orgId, projectId };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WatchlistEntry {
  id:                       string;
  officialDomainRaw:        string;
  officialDomainNormalized: string;
  label:                    string | null;
  active:                   boolean;
  intervalHours:            number;
  lastScanAt:               string | null;
  lastScanStatus:           "running" | "success" | "error" | null;
  nextRunAt:                string | null;
  suspiciousCount:          number;
  createdAt:                string;
}

export interface WatchlistDetail extends WatchlistEntry {
  candidateCount:      number;
  similarityThreshold: number;
  tldStrategy:         string;
  tldAllowlist:        string[];
  tldSuspicious:       string[];
}

export interface CandidateDomain {
  id:              string;
  domain:          string;
  source:          string;
  similarityScore: number;
  tld:             string;
  isActive:        boolean;
  rdapRegistered:  boolean | null;
  rdapCheckedAt:   string | null;
  riskLevel:       string | null;
  createdAt:       string;
}

export interface ScanLog {
  id:              string;
  scanStatus:      string;
  candidatesFound: number;
  newFound:        number;
  errorMessage:    string | null;
  scannedAt:       string;
}

export interface CreateWatchlistInput {
  domain:               string;
  label?:               string;
  intervalHours?:       number;
  candidateCount?:      number;
  similarityThreshold?: number;
  tldStrategy?:         "SAME_TLD_ONLY" | "ALLOWLIST" | "MIXED";
  tldAllowlist?:        string[];
  tldSuspicious?:       string[];
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export function getWatchlist(): Promise<WatchlistEntry[]> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist`);
}

export function getWatchlistEntry(watchlistId: string): Promise<WatchlistDetail> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}`);
}

export function createWatchlistEntry(data: CreateWatchlistInput): Promise<WatchlistEntry> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist`, {
    method: "POST",
    body:   JSON.stringify(data),
  });
}

export function updateWatchlistEntry(
  watchlistId: string,
  data: { label?: string; active?: boolean; intervalHours?: number; similarityThreshold?: number }
): Promise<WatchlistDetail> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}`, {
    method: "PATCH",
    body:   JSON.stringify(data),
  });
}

export function deleteWatchlistEntry(watchlistId: string): Promise<void> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}`, {
    method: "DELETE",
  });
}

export function triggerScan(watchlistId: string): Promise<{ queued: boolean }> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}/scan`, {
    method: "POST",
  });
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export function getCandidates(watchlistId: string): Promise<{ items: CandidateDomain[] }> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}/candidates`);
}

export function addCandidates(watchlistId: string, domains: string[]): Promise<{ added: number }> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}/candidates`, {
    method: "POST",
    body:   JSON.stringify({ domains }),
  });
}

// ─── Scan logs ────────────────────────────────────────────────────────────────

export function getScanLogs(watchlistId: string): Promise<{ logs: ScanLog[] }> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}/scans`);
}