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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function toStringSafe(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumberSafe(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeStatus(value: unknown): WatchlistEntry["lastScanStatus"] {
  if (value === "running" || value === "success" || value === "error") return value;
  return null;
}

function unwrapArray(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value)) {
    for (const key of keys) {
      const candidate = value[key];
      if (Array.isArray(candidate)) return candidate;
    }
  }
  return [];
}

function unwrapObject(value: unknown, keys: string[]): Record<string, unknown> | null {
  if (isRecord(value)) {
    for (const key of keys) {
      const nested = value[key];
      if (isRecord(nested)) return nested;
    }
    return value;
  }
  return null;
}

function normalizeWatchlistEntry(raw: unknown): WatchlistEntry {
  const data = isRecord(raw) ? raw : {};
  const officialDomainRaw = toStringSafe(data.officialDomainRaw ?? data.official_domain_raw ?? data.domain);
  const officialDomainNormalized = toStringSafe(
    data.officialDomainNormalized ?? data.official_domain_normalized ?? data.domainNormalized ?? data.domain
  );

  return {
    id: toStringSafe(data.id, officialDomainNormalized || officialDomainRaw),
    officialDomainRaw,
    officialDomainNormalized,
    label: typeof data.label === "string" ? data.label : null,
    active: Boolean(data.active ?? data.isActive ?? true),
    intervalHours: toNumberSafe(data.intervalHours ?? data.interval_hours, 6),
    lastScanAt: typeof data.lastScanAt === "string" ? data.lastScanAt : null,
    lastScanStatus: normalizeStatus(data.lastScanStatus ?? data.last_scan_status),
    nextRunAt: typeof data.nextRunAt === "string" ? data.nextRunAt : null,
    suspiciousCount: toNumberSafe(data.suspiciousCount ?? data.suspicious_count, 0),
    createdAt: toStringSafe(data.createdAt ?? data.created_at, new Date().toISOString()),
  };
}

function normalizeWatchlistDetail(raw: unknown): WatchlistDetail {
  const base = normalizeWatchlistEntry(raw);
  const data = isRecord(raw) ? raw : {};

  return {
    ...base,
    candidateCount: toNumberSafe(data.candidateCount ?? data.candidate_count, 0),
    similarityThreshold: toNumberSafe(data.similarityThreshold ?? data.similarity_threshold, 0),
    tldStrategy: toStringSafe(data.tldStrategy ?? data.tld_strategy, "MIXED"),
    tldAllowlist: Array.isArray(data.tldAllowlist) ? data.tldAllowlist.map((v) => String(v)) : [],
    tldSuspicious: Array.isArray(data.tldSuspicious) ? data.tldSuspicious.map((v) => String(v)) : [],
  };
}

function normalizeCandidate(raw: unknown): CandidateDomain {
  const data = isRecord(raw) ? raw : {};
  return {
    id: toStringSafe(data.id),
    domain: toStringSafe(data.domain),
    source: toStringSafe(data.source, "generated"),
    similarityScore: toNumberSafe(data.similarityScore ?? data.similarity_score, 0),
    tld: toStringSafe(data.tld),
    isActive: Boolean(data.isActive ?? data.active ?? true),
    rdapRegistered:
      typeof data.rdapRegistered === "boolean"
        ? data.rdapRegistered
        : typeof data.rdap_registered === "boolean"
          ? data.rdap_registered
          : null,
    rdapCheckedAt:
      typeof data.rdapCheckedAt === "string"
        ? data.rdapCheckedAt
        : typeof data.rdap_checked_at === "string"
          ? data.rdap_checked_at
          : null,
    riskLevel:
      typeof data.riskLevel === "string"
        ? data.riskLevel
        : typeof data.risk_level === "string"
          ? data.risk_level
          : null,
    createdAt: toStringSafe(data.createdAt ?? data.created_at, new Date().toISOString()),
  };
}

function normalizeScanLog(raw: unknown): ScanLog {
  const data = isRecord(raw) ? raw : {};
  return {
    id: toStringSafe(data.id),
    scanStatus: toStringSafe(data.scanStatus ?? data.scan_status, "success"),
    candidatesFound: toNumberSafe(data.candidatesFound ?? data.candidates_found, 0),
    newFound: toNumberSafe(data.newFound ?? data.new_found, 0),
    errorMessage:
      typeof data.errorMessage === "string"
        ? data.errorMessage
        : typeof data.error_message === "string"
          ? data.error_message
          : null,
    scannedAt: toStringSafe(data.scannedAt ?? data.scanned_at, new Date().toISOString()),
  };
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export async function getWatchlist(): Promise<WatchlistEntry[]> {
  const { orgId, projectId } = ctx();
  const response = await api<unknown>(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist`);
  const rows = unwrapArray(response, ["items", "data", "results", "watchlist", "entries"]);
  if (rows.length > 0) {
    return rows.map(normalizeWatchlistEntry);
  }

  // Some backends return a single object for one-entry watchlists.
  if (isRecord(response)) {
    return [normalizeWatchlistEntry(response)];
  }

  return [];
}

export async function getWatchlistEntry(watchlistId: string): Promise<WatchlistDetail> {
  const { orgId, projectId } = ctx();
  const response = await api<unknown>(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}`);
  const detail = unwrapObject(response, ["item", "data", "watchlist", "entry"]);
  return normalizeWatchlistDetail(detail ?? {});
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

export async function getCandidates(watchlistId: string): Promise<{ items: CandidateDomain[] }> {
  const { orgId, projectId } = ctx();
  const response = await api<unknown>(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}/candidates`);
  const items = unwrapArray(response, ["items", "data", "results", "candidates"]);
  return { items: items.map(normalizeCandidate) };
}

export function addCandidates(watchlistId: string, domains: string[]): Promise<{ added: number }> {
  const { orgId, projectId } = ctx();
  return api(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}/candidates`, {
    method: "POST",
    body:   JSON.stringify({ domains }),
  });
}

// ─── Scan logs ────────────────────────────────────────────────────────────────

export async function getScanLogs(watchlistId: string): Promise<{ logs: ScanLog[] }> {
  const { orgId, projectId } = ctx();
  const response = await api<unknown>(`/api/v1/orgs/${orgId}/projects/${projectId}/watchlist/${watchlistId}/scans`);
  const logs = unwrapArray(response, ["logs", "items", "data", "results", "scans"]);
  return { logs: logs.map(normalizeScanLog) };
}