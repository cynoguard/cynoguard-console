import { apiGet, apiPost, apiPatch } from './client';
import type {
    WatchlistEntry,
    Finding,
    AlertEvent,
    Scan,
    PaginatedResponse,
    FindingsQuery,
    AlertsQuery,
    ScansQuery,
} from '@/types/domain-monitoring';

// ── Watchlist ───────────────────────────────────────────────────────

export async function getWatchlist(): Promise<WatchlistEntry[]> {
    return apiGet<WatchlistEntry[]>('/watchlist');
}

export async function getWatchlistEntry(id: string): Promise<WatchlistEntry> {
    return apiGet<WatchlistEntry>(`/watchlist/${id}`);
}

export async function addDomain(domain: string, intervalHours?: number): Promise<WatchlistEntry> {
    return apiPost<WatchlistEntry>('/watchlist', { domain, intervalHours });
}

export async function updateWatchlistEntry(
    id: string,
    data: { active?: boolean; intervalHours?: number }
): Promise<WatchlistEntry> {
    return apiPatch<WatchlistEntry>(`/watchlist/${id}`, data);
}

export async function triggerScan(id: string): Promise<{ scanId: string }> {
    return apiPost<{ scanId: string }>(`/watchlist/${id}/scan`, {});
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
        `/watchlist/${id}/findings${qs ? `?${qs}` : ''}`
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
        `/watchlist/${id}/alerts${qs ? `?${qs}` : ''}`
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
        `/watchlist/${id}/scans${qs ? `?${qs}` : ''}`
    );
}
