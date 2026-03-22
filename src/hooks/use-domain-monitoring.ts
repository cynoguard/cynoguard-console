import {
    addCandidates,
    createWatchlistEntry,
    deleteWatchlistEntry,
    getCandidates,
    getScanLogs,
    getWatchlist, getWatchlistEntry,
    triggerScan,
    updateWatchlistEntry,
    type CreateWatchlistInput,
} from "@/lib/api/domain-monitoring";
import type {
    AlertEvent,
    AlertsQuery,
    Finding,
    FindingsQuery,
    PaginatedResponse,
    Scan,
    ScansQuery,
} from "@/types/domain-monitoring";
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

function paginate<T>(items: T[], query?: { page?: number; pageSize?: number }): PaginatedResponse<T> {
  const page = query?.page ?? 1;
  const pageSize = query?.pageSize ?? 10;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
  };
}

export function useFindings(watchlistId: string, query?: FindingsQuery) {
  return useQuery({
    queryKey: ["findings", watchlistId, query] as const,
    enabled: !!watchlistId,
    queryFn: async (): Promise<PaginatedResponse<Finding>> => {
      const candidates = await getCandidates(watchlistId);
      const normalized: Finding[] = candidates.items.map((candidate) => ({
        id: candidate.id,
        candidateDomain: candidate.domain,
        similarityScore: candidate.similarityScore,
        levenshteinDistance: Math.max(0, Math.round((1 - candidate.similarityScore) * 10)),
        isLive: candidate.rdapRegistered ?? false,
        firstSeenAt: candidate.createdAt,
        lastSeenAt: candidate.rdapCheckedAt ?? candidate.createdAt,
        dnsSignals: {
          hasMX: candidate.riskLevel === "high",
        },
        sslSignals: {
          sslStatus: "unknown",
        },
        riskReason: candidate.riskLevel ? [candidate.riskLevel.toUpperCase()] : [],
      }));

      const filtered = normalized.filter((item) => {
        if (query?.query && !item.candidateDomain.toLowerCase().includes(query.query.toLowerCase())) {
          return false;
        }
        if (query?.minSimilarity != null && item.similarityScore < query.minSimilarity) {
          return false;
        }
        if (query?.isLive != null && item.isLive !== query.isLive) {
          return false;
        }
        return true;
      });

      const sort = query?.sort ?? "similarity_desc";
      filtered.sort((a, b) => {
        if (sort === "last_seen_desc") {
          return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
        }
        if (sort === "first_seen_desc") {
          return new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime();
        }
        return b.similarityScore - a.similarityScore;
      });

      return paginate(filtered, query);
    },
  });
}

export function useAlerts(watchlistId: string, query?: AlertsQuery) {
  return useQuery({
    queryKey: ["alerts", watchlistId, query] as const,
    enabled: !!watchlistId,
    queryFn: async (): Promise<PaginatedResponse<AlertEvent>> => {
      const findings = await getCandidates(watchlistId);
      const alerts: AlertEvent[] = findings.items
        .filter((candidate) => candidate.riskLevel !== null)
        .map((candidate) => ({
          id: `alert-${candidate.id}`,
          candidateDomain: candidate.domain,
          triggeredAt: candidate.rdapCheckedAt ?? candidate.createdAt,
          reason: `${candidate.riskLevel?.toUpperCase() ?? "UNKNOWN"} risk signal detected`,
          payload: {
            similarityScore: candidate.similarityScore,
            isLive: candidate.rdapRegistered ?? false,
            hasMX: candidate.riskLevel === "high",
            sslStatus: "unknown",
          },
        }));

      alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
      return paginate(alerts, query);
    },
  });
}

export function useScans(watchlistId: string, query?: ScansQuery) {
  return useQuery({
    queryKey: ["scans-history", watchlistId, query] as const,
    enabled: !!watchlistId,
    queryFn: async (): Promise<PaginatedResponse<Scan>> => {
      const logs = await getScanLogs(watchlistId);
      const scans: Scan[] = logs.logs.map((log) => {
        const normalizedStatus: Scan["status"] =
          log.scanStatus === "success" || log.scanStatus === "error" || log.scanStatus === "running"
            ? log.scanStatus
            : "success";
        return {
          id: log.id,
          startedAt: log.scannedAt,
          finishedAt: normalizedStatus === "running" ? undefined : log.scannedAt,
          status: normalizedStatus,
          totals: {
            totalCandidates: log.candidatesFound,
            totalLiveFound: log.newFound,
            errors: normalizedStatus === "error" ? 1 : 0,
          },
        };
      });

      scans.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      return paginate(scans, query);
    },
  });
}