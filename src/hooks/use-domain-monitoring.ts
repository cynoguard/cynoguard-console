import {
    addCandidates,
    createWatchlistEntry,
    deleteWatchlistEntry,
    getAlerts,
    getCandidates,
    getFindings,
    getScanLogs,
    getScans,
    getWatchlist, getWatchlistEntry,
    triggerScan,
    updateWatchlistEntry,
    type AlertsQuery,
    type CreateWatchlistInput,
    type FindingsQuery,
    type ScansQuery
} from "@/lib/api/domain-monitoring";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEYS = {
  watchlist:      ["watchlist"]                    as const,
  entry:    (id: string) => ["watchlist", id]      as const,
  candidates:(id: string) => ["candidates", id]   as const,
  scans:    (id: string) => ["scan-logs", id]      as const,
};

export function useWatchlist() {
  return useQuery({
    queryKey: KEYS.watchlist,
    queryFn:  getWatchlist,
  });
}

export function useWatchlistEntry(watchlistId: string) {
  return useQuery({
    queryKey: KEYS.entry(watchlistId),
    queryFn:  () => getWatchlistEntry(watchlistId),
    enabled:  !!watchlistId,
  });
}

export function useCreateWatchlistEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWatchlistInput) => createWatchlistEntry(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.watchlist }),
  });
}

export function useUpdateWatchlistEntry(watchlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { label?: string; active?: boolean; intervalHours?: number }) =>
      updateWatchlistEntry(watchlistId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.watchlist });
      qc.invalidateQueries({ queryKey: KEYS.entry(watchlistId) });
    },
  });
}

export function useDeleteWatchlistEntry(watchlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deleteWatchlistEntry(watchlistId),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.watchlist }),
  });
}

export function useToggleActive(watchlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (active: boolean) => updateWatchlistEntry(watchlistId, { active }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.watchlist });
      qc.invalidateQueries({ queryKey: KEYS.entry(watchlistId) });
    },
  });
}

export function useTriggerScan(watchlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => triggerScan(watchlistId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.watchlist });
      qc.invalidateQueries({ queryKey: KEYS.entry(watchlistId) });
    },
  });
}

export function useCandidates(watchlistId: string) {
  return useQuery({
    queryKey: KEYS.candidates(watchlistId),
    queryFn:  () => getCandidates(watchlistId),
    enabled:  !!watchlistId,
  });
}

export function useAddCandidates(watchlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domains: string[]) => addCandidates(watchlistId, domains),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEYS.candidates(watchlistId) }),
  });
}

export function useScanLogs(watchlistId: string) {
  return useQuery({
    queryKey: KEYS.scans(watchlistId),
    queryFn:  () => getScanLogs(watchlistId),
    enabled:  !!watchlistId,
  });
}

// Compatibility hooks used by existing domain-monitoring UI components.
export function useAddDomain() {
  return useCreateWatchlistEntry();
}

export function useFindings(watchlistId: string, query?: FindingsQuery) {
  return useQuery({
    queryKey: ["findings", watchlistId, query] as const,
    enabled: !!watchlistId,
    queryFn: () => getFindings(watchlistId, query),
  });
}

export function useAlerts(watchlistId: string, query?: AlertsQuery) {
  return useQuery({
    queryKey: ["alerts", watchlistId, query] as const,
    enabled: !!watchlistId,
    queryFn: () => getAlerts(watchlistId, query),
  });
}

export function useScans(watchlistId: string, query?: ScansQuery) {
  return useQuery({
    queryKey: ["scans-history", watchlistId, query] as const,
    enabled: !!watchlistId,
    queryFn: () => getScans(watchlistId, query),
  });
}