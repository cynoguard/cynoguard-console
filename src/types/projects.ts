export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
  botsCount?: number;
  domainsCount?: number;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  message?: string;
}
