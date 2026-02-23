import type {
    WatchlistEntry,
    Finding,
    AlertEvent,
    Scan,
} from "@/types/domain-monitoring";

// ── Mock Watchlist Entries ──────────────────────────────────────────

export const mockWatchlist: WatchlistEntry[] = [
    {
        id: "wl-1",
        officialDomainRaw: "https://cynoguard.com",
        officialDomainNormalized: "cynoguard.com",
        active: true,
        intervalHours: 6,
        lastScanAt: "2026-02-22T10:30:00Z",
        nextRunAt: "2026-02-22T16:30:00Z",
        lastScanStatus: "success",
        suspiciousCount: 14,
    },
    {
        id: "wl-2",
        officialDomainRaw: "www.acmebank.com",
        officialDomainNormalized: "acmebank.com",
        active: true,
        intervalHours: 12,
        lastScanAt: "2026-02-22T06:00:00Z",
        nextRunAt: "2026-02-22T18:00:00Z",
        lastScanStatus: "success",
        suspiciousCount: 8,
    },
    {
        id: "wl-3",
        officialDomainRaw: "securepay.io",
        officialDomainNormalized: "securepay.io",
        active: true,
        intervalHours: 6,
        lastScanAt: "2026-02-22T12:00:00Z",
        nextRunAt: "2026-02-22T18:00:00Z",
        lastScanStatus: "running",
        suspiciousCount: 3,
    },
    {
        id: "wl-4",
        officialDomainRaw: "cloudvault.dev",
        officialDomainNormalized: "cloudvault.dev",
        active: false,
        intervalHours: 24,
        lastScanAt: "2026-02-20T08:00:00Z",
        nextRunAt: undefined,
        lastScanStatus: "error",
        suspiciousCount: 0,
    },
    {
        id: "wl-5",
        officialDomainRaw: "https://www.nextera.co",
        officialDomainNormalized: "nextera.co",
        active: true,
        intervalHours: 12,
        lastScanAt: "2026-02-22T02:00:00Z",
        nextRunAt: "2026-02-22T14:00:00Z",
        lastScanStatus: "success",
        suspiciousCount: 22,
    },
    {
        id: "wl-6",
        officialDomainRaw: "globalfinance.org",
        officialDomainNormalized: "globalfinance.org",
        active: true,
        intervalHours: 6,
        lastScanAt: "2026-02-22T11:15:00Z",
        nextRunAt: "2026-02-22T17:15:00Z",
        lastScanStatus: "success",
        suspiciousCount: 5,
    },
];

// ── Mock Findings ───────────────────────────────────────────────────

export function generateMockFindings(domainBase: string): Finding[] {
    const suffixes = [
        { domain: `${domainBase.replace(".", "")}.net`, sim: 0.95, dist: 2 },
        { domain: `${domainBase.replace(".", "-")}.com`, sim: 0.92, dist: 1 },
        { domain: `${domainBase}s.com`, sim: 0.91, dist: 1 },
        { domain: `${domainBase.slice(0, -4)}-login.com`, sim: 0.88, dist: 5 },
        { domain: `${domainBase.replace(".", "0")}.com`, sim: 0.86, dist: 1 },
        { domain: `secure-${domainBase}`, sim: 0.84, dist: 7 },
        { domain: `${domainBase.replace("a", "@")}.com`, sim: 0.83, dist: 1 },
        { domain: `my${domainBase}`, sim: 0.82, dist: 2 },
        { domain: `${domainBase}.xyz`, sim: 0.80, dist: 3 },
        { domain: `${domainBase.slice(0, -4)}.tech`, sim: 0.79, dist: 4 },
        { domain: `support-${domainBase}`, sim: 0.78, dist: 8 },
        { domain: `${domainBase.slice(0, -4)}-app.com`, sim: 0.77, dist: 4 },
        { domain: `login-${domainBase}`, sim: 0.76, dist: 6 },
        { domain: `${domainBase.replace(".", "1")}.com`, sim: 0.75, dist: 1 },
        { domain: `${domainBase}-verify.com`, sim: 0.73, dist: 7 },
        { domain: `update-${domainBase}`, sim: 0.72, dist: 7 },
        { domain: `${domainBase.slice(0, -4)}-secure.net`, sim: 0.71, dist: 8 },
        { domain: `${domainBase.replace(".", "l")}.com`, sim: 0.70, dist: 1 },
        { domain: `${domainBase}-auth.io`, sim: 0.68, dist: 5 },
        { domain: `${domainBase.slice(0, -4)}-portal.com`, sim: 0.65, dist: 7 },
    ];

    return suffixes.map((s, i) => ({
        id: `finding-${i + 1}`,
        candidateDomain: s.domain,
        similarityScore: s.sim,
        levenshteinDistance: s.dist,
        isLive: i < 12,
        firstSeenAt: new Date(Date.now() - (20 - i) * 86400000).toISOString(),
        lastSeenAt: new Date(Date.now() - i * 3600000).toISOString(),
        dnsSignals: {
            hasA: i < 14,
            hasAAAA: i % 3 === 0,
            hasCNAME: i % 4 === 0,
            hasNS: i < 10,
            hasMX: i < 6,
        },
        whoisSignals: {
            isRegistered: i < 15,
            registrar: i < 15 ? ["Namecheap", "GoDaddy", "Cloudflare", "Tucows"][i % 4] : undefined,
            createdAt: new Date(Date.now() - (30 - i) * 86400000).toISOString(),
            expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
            whoisStatus: i < 15 ? "ok" : "unknown",
        },
        sslSignals: {
            sslStatus: i < 8 ? "valid" : i < 12 ? "expired" : "not_found",
            expiresAt: i < 8 ? new Date(Date.now() + 180 * 86400000).toISOString() : undefined,
        },
        riskReason: [
            ...(s.sim >= 0.9 ? ["High similarity"] : []),
            ...(i < 6 ? ["MX present"] : []),
            ...(i < 5 ? ["Recently registered"] : []),
            ...(i < 8 ? ["SSL valid"] : []),
        ],
    }));
}

// ── Mock Alerts ─────────────────────────────────────────────────────

export function generateMockAlerts(domainBase: string): AlertEvent[] {
    const alerts: AlertEvent[] = [
        {
            id: "alert-1",
            candidateDomain: `${domainBase.replace(".", "")}.net`,
            triggeredAt: "2026-02-22T10:30:15Z",
            reason: "New high-similarity domain detected",
            payload: { similarityScore: 0.95, isLive: true, hasMX: true },
        },
        {
            id: "alert-2",
            candidateDomain: `${domainBase.replace(".", "-")}.com`,
            triggeredAt: "2026-02-22T10:30:20Z",
            reason: "Domain went live with MX records",
            payload: { similarityScore: 0.92, isLive: true, hasMX: true, sslStatus: "valid" },
        },
        {
            id: "alert-3",
            candidateDomain: `secure-${domainBase}`,
            triggeredAt: "2026-02-21T14:15:00Z",
            reason: "SSL certificate issued on lookalike",
            payload: { similarityScore: 0.84, isLive: true, sslStatus: "valid" },
        },
        {
            id: "alert-4",
            candidateDomain: `${domainBase}s.com`,
            triggeredAt: "2026-02-21T08:00:00Z",
            reason: "New registration detected",
            payload: { similarityScore: 0.91, registrar: "Namecheap", isLive: false },
        },
        {
            id: "alert-5",
            candidateDomain: `${domainBase.slice(0, -4)}-login.com`,
            triggeredAt: "2026-02-20T16:30:00Z",
            reason: "Phishing indicators detected",
            payload: { similarityScore: 0.88, isLive: true, hasMX: true, hasLoginPage: true },
        },
        {
            id: "alert-6",
            candidateDomain: `my${domainBase}`,
            triggeredAt: "2026-02-20T10:00:00Z",
            reason: "Domain went live",
            payload: { similarityScore: 0.82, isLive: true },
        },
        {
            id: "alert-7",
            candidateDomain: `login-${domainBase}`,
            triggeredAt: "2026-02-19T22:00:00Z",
            reason: "High-risk domain registered",
            payload: { similarityScore: 0.76, registrar: "GoDaddy" },
        },
        {
            id: "alert-8",
            candidateDomain: `${domainBase.replace(".", "0")}.com`,
            triggeredAt: "2026-02-19T12:00:00Z",
            reason: "Homoglyph domain detected",
            payload: { similarityScore: 0.86, isLive: true },
        },
    ];
    return alerts;
}

// ── Mock Scans ──────────────────────────────────────────────────────

export function generateMockScans(): Scan[] {
    return [
        {
            id: "scan-1",
            startedAt: "2026-02-22T10:30:00Z",
            finishedAt: "2026-02-22T10:32:45Z",
            status: "success",
            totals: { totalCandidates: 1847, totalLiveFound: 12, errors: 0 },
        },
        {
            id: "scan-2",
            startedAt: "2026-02-22T04:30:00Z",
            finishedAt: "2026-02-22T04:33:12Z",
            status: "success",
            totals: { totalCandidates: 1844, totalLiveFound: 11, errors: 1 },
        },
        {
            id: "scan-3",
            startedAt: "2026-02-21T22:30:00Z",
            finishedAt: "2026-02-21T22:31:50Z",
            status: "success",
            totals: { totalCandidates: 1840, totalLiveFound: 10, errors: 0 },
        },
        {
            id: "scan-4",
            startedAt: "2026-02-21T16:30:00Z",
            finishedAt: "2026-02-21T16:34:00Z",
            status: "error",
            totals: { totalCandidates: 1200, totalLiveFound: 5, errors: 12 },
        },
        {
            id: "scan-5",
            startedAt: "2026-02-21T10:30:00Z",
            finishedAt: "2026-02-21T10:33:22Z",
            status: "success",
            totals: { totalCandidates: 1838, totalLiveFound: 9, errors: 0 },
        },
        {
            id: "scan-running",
            startedAt: new Date().toISOString(),
            status: "running",
            totals: { totalCandidates: 0, totalLiveFound: 0, errors: 0 },
        },
    ];
}
