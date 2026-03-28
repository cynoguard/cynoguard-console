import type {
    AlertEvent,
    AlertsQuery,
    Finding,
    FindingsQuery,
    PaginatedResponse,
    Scan,
    ScansQuery,
    WatchlistEntry,
} from '@/types/domain-monitoring';
import { apiGet, apiPatch, apiPost } from './client';

export const DOMAIN_MONITORING_PATHS = {
    watchlist: '/watchlist',
    watchlistById: (id: string) => `/watchlist/${id}`,
    watchlistScan: (id: string) => `/watchlist/${id}/scan`,
    watchlistFindings: (id: string) => `/watchlist/${id}/findings`,
    watchlistAlerts: (id: string) => `/watchlist/${id}/alerts`,
    watchlistScans: (id: string) => `/watchlist/${id}/scans`,
} as const;

// ── Watchlist ───────────────────────────────────────────────────────

export async function getWatchlist(): Promise<WatchlistEntry[]> {
    return apiGet<WatchlistEntry[]>(DOMAIN_MONITORING_PATHS.watchlist);
}

export async function getWatchlistEntry(id: string): Promise<WatchlistEntry> {
    return apiGet<WatchlistEntry>(DOMAIN_MONITORING_PATHS.watchlistById(id));
}

export async function addDomain(domain: string, intervalHours?: number): Promise<WatchlistEntry> {
    return apiPost<WatchlistEntry>(DOMAIN_MONITORING_PATHS.watchlist, { domain, intervalHours });
}

export async function updateWatchlistEntry(
    id: string,
    data: { active?: boolean; intervalHours?: number }
): Promise<WatchlistEntry> {
    return apiPatch<WatchlistEntry>(DOMAIN_MONITORING_PATHS.watchlistById(id), data);
}

export async function triggerScan(id: string): Promise<{ scanId: string }> {
    return apiPost<{ scanId: string }>(DOMAIN_MONITORING_PATHS.watchlistScan(id), {});
}

// ── Findings ────────────────────────────────────────────────────────

export async function getFindings(
    id: string,
    params?: FindingsQuery
): Promise<PaginatedResponse<Finding>> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.minSimilarity !== undefined)
        searchParams.set('minSimilarity', String(params.minSimilarity));
    if (params?.isLive !== undefined) searchParams.set('isLive', String(params.isLive));
    if (params?.sort) searchParams.set('sort', params.sort);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const qs = searchParams.toString();
    return apiGet<PaginatedResponse<Finding>>(
        `${DOMAIN_MONITORING_PATHS.watchlistFindings(id)}${qs ? `?${qs}` : ''}`
    );
}

// ── Alerts ──────────────────────────────────────────────────────────

export async function getAlerts(
    id: string,
    params?: AlertsQuery
): Promise<PaginatedResponse<AlertEvent>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const qs = searchParams.toString();
    return apiGet<PaginatedResponse<AlertEvent>>(
        `${DOMAIN_MONITORING_PATHS.watchlistAlerts(id)}${qs ? `?${qs}` : ''}`
    );
}

// ── Scans ───────────────────────────────────────────────────────────

export async function getScans(
    id: string,
    params?: ScansQuery
): Promise<PaginatedResponse<Scan>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));

    const qs = searchParams.toString();
    return apiGet<PaginatedResponse<Scan>>(
        `${DOMAIN_MONITORING_PATHS.watchlistScans(id)}${qs ? `?${qs}` : ''}`
    );
}
