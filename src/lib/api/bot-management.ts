import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

// No auth interceptor — dashboard is protected by layout.tsx onAuthStateChanged
// projectId is always read from localStorage
export const getActiveProjectId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("activeProjectId");
};

const apiClient = axios.create({ baseURL: BASE_URL });

export type OverviewRange = "24h" | "7d" | "30d";

export const fetchBotOverview = async (range: OverviewRange = "7d") => {
  const projectId = getActiveProjectId();
  const { data } = await apiClient.get("/api/v1/bot-management/overview", {
    params: { projectId, range },
  });
  return data.data;
};

export const fetchProjectApiKeys = async () => {
  const projectId = getActiveProjectId();
  const { data } = await apiClient.get("/api/v1/bot-management/rules", {
    params: { projectId },
  });
  return data.data;
};

export const fetchDetectionLogs = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
}) => {
  const projectId = getActiveProjectId();
  const { data } = await apiClient.get("/api/v1/bot-management/detections", {
    params: { projectId, ...params },
  });
  return data.data;
};

export const updateRules = async (payload: {
  keyIds: string[];
  rules: {
    strictness: string;
    persistence: number;
    signals: Record<string, boolean>;
    whitelist: { name: string; type: string; value: string }[];
  };
}) => {
  const { data } = await apiClient.patch("/api/v1/bot-management/rules", payload);
  return data.data;
};


export const fetchApiKeyMetrics = async (keyId: string, range: OverviewRange = "7d") => {
  const { data } = await apiClient.get(`/api/v1/bot-management/keys/${keyId}/metrics`, {
    params: { range },
  });
  return data.data;
};


export const fetchGeoDistribution = async (range: OverviewRange = "7d") => {
  const projectId = getActiveProjectId();
  const { data } = await apiClient.get("/api/v1/bot-management/geo", {
    params: { projectId, range },
  });
  return data.data;
};