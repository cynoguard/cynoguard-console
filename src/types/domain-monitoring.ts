// ── Domain Monitoring Types ─────────────────────────────────────────

export type ScanStatus = "idle" | "running" | "success" | "error";

export interface WatchlistEntry {
    id: string;
    officialDomainRaw: string;
    officialDomainNormalized: string;
    active: boolean;
    intervalHours: number;
    lastScanAt?: string;
    nextRunAt?: string;
    lastScanStatus?: ScanStatus;
    suspiciousCount?: number;
}

export interface DnsSignals {
    hasA?: boolean;
    hasAAAA?: boolean;
    hasCNAME?: boolean;
    hasNS?: boolean;
    hasMX?: boolean;
}

export interface WhoisSignals {
    isRegistered?: boolean;
    registrar?: string;
    createdAt?: string;
    expiresAt?: string;
    whoisStatus?: "ok" | "error" | "unknown";
}

export interface SslSignals {
    sslStatus?: "valid" | "expired" | "not_found" | "unknown";
    expiresAt?: string;
}

export interface Finding {
    id: string;
    candidateDomain: string;
    similarityScore: number;
    levenshteinDistance: number;
    isLive: boolean;
    firstSeenAt: string;
    lastSeenAt: string;
    dnsSignals?: DnsSignals;
    whoisSignals?: WhoisSignals;
    sslSignals?: SslSignals;
    riskReason?: string[];
}

export interface AlertEvent {
    id: string;
    candidateDomain: string;
    triggeredAt: string;
    reason: string;
    payload: Record<string, unknown>;
}

export type ScanStatusType = "running" | "success" | "error";

export interface Scan {
    id: string;
    startedAt: string;
    finishedAt?: string;
    status: ScanStatusType;
    totals: {
        totalCandidates: number;
        totalLiveFound: number;
        errors: number;
    };
}

// ── Paginated Response ──────────────────────────────────────────────

export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    total: number;
}

// ── Query Parameters ────────────────────────────────────────────────

export interface FindingsQuery {
    query?: string;
    minSimilarity?: number;
    isLive?: boolean;
    sort?: "similarity_desc" | "last_seen_desc" | "first_seen_desc";
    page?: number;
    pageSize?: number;
}

export interface AlertsQuery {
    page?: number;
    pageSize?: number;
}

export interface ScansQuery {
    page?: number;
    pageSize?: number;
}
