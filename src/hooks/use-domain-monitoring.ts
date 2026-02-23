"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getWatchlist,
    getWatchlistEntry,
    addDomain,
    updateWatchlistEntry,
    triggerScan,
    getFindings,
    getAlerts,
    getScans,
} from "@/services/api/domain-monitoring";
import type { FindingsQuery, AlertsQuery, ScansQuery } from "@/types/domain-monitoring";

// ── Query Keys ──────────────────────────────────────────────────────

export const domainMonitoringKeys = {
    all: ["domain-monitoring"] as const,
    watchlist: () => [...domainMonitoringKeys.all, "watchlist"] as const,
    entry: (id: string) => [...domainMonitoringKeys.all, "entry", id] as const,
    findings: (id: string, params?: FindingsQuery) =>
        [...domainMonitoringKeys.all, "findings", id, params] as const,
    alerts: (id: string, params?: AlertsQuery) =>
        [...domainMonitoringKeys.all, "alerts", id, params] as const,
    scans: (id: string, params?: ScansQuery) =>
        [...domainMonitoringKeys.all, "scans", id, params] as const,
};

// ── Queries ─────────────────────────────────────────────────────────

export function useWatchlist() {
    return useQuery({
        queryKey: domainMonitoringKeys.watchlist(),
        queryFn: getWatchlist,
    });
}

export function useWatchlistEntry(id: string) {
    return useQuery({
        queryKey: domainMonitoringKeys.entry(id),
        queryFn: () => getWatchlistEntry(id),
        enabled: !!id,
    });
}

export function useFindings(id: string, params?: FindingsQuery) {
    return useQuery({
        queryKey: domainMonitoringKeys.findings(id, params),
        queryFn: () => getFindings(id, params),
        enabled: !!id,
    });
}

export function useAlerts(id: string, params?: AlertsQuery) {
    return useQuery({
        queryKey: domainMonitoringKeys.alerts(id, params),
        queryFn: () => getAlerts(id, params),
        enabled: !!id,
    });
}

export function useScans(id: string, params?: ScansQuery) {
    return useQuery({
        queryKey: domainMonitoringKeys.scans(id, params),
        queryFn: () => getScans(id, params),
        enabled: !!id,
    });
}

// ── Mutations ───────────────────────────────────────────────────────

export function useAddDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ domain, intervalHours }: { domain: string; intervalHours?: number }) =>
            addDomain(domain, intervalHours),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.watchlist() });
        },
    });
}

export function useToggleActive(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (active: boolean) => updateWatchlistEntry(id, { active }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.watchlist() });
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.entry(id) });
        },
    });
}

export function useUpdateInterval(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (intervalHours: number) => updateWatchlistEntry(id, { intervalHours }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.watchlist() });
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.entry(id) });
        },
    });
}

export function useTriggerScan(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => triggerScan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.watchlist() });
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.entry(id) });
            queryClient.invalidateQueries({ queryKey: domainMonitoringKeys.scans(id) });
        },
    });
}
