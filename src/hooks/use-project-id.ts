// hooks/use-project-id.ts
// 
// THE PROPER FIX for multi-user / multi-project support.
//
// Instead of reading projectId from localStorage (which breaks for every
// user except the last one who set it), this hook resolves the projectId
// by calling the server with the org name and project name taken directly
// from the URL params.
//
// This works correctly for:
//   - Every user who signs up
//   - Every project they create
//   - Any number of concurrent users
//   - Switching between projects

"use client";

import { auth } from "@/lib/firebase";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ProjectIdState {
  projectId: string | null;
  loading:   boolean;
  error:     string | null;
}

export function useProjectId(): ProjectIdState {
  const params = useParams();
  const org     = params?.org     as string | undefined;
  const project = params?.project as string | undefined;

  const [state, setState] = useState<ProjectIdState>({
    projectId: null,
    loading:   true,
    error:     null,
  });

  useEffect(() => {
    if (!org || !project) {
      setState({ projectId: null, loading: false, error: "Missing org or project in URL" });
      return;
    }

    let cancelled = false;

    const resolve = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // Get Firebase token for auth
        const user = auth.currentUser;
        const headers: Record<string, string> = {};
        if (user) {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(
          `https://api.cynoguard.com/api/project-id?orgName=${encodeURIComponent(org)}&projectName=${encodeURIComponent(project)}`,
          { headers }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const projectId: string = data?.data?.projectId;

        if (!projectId) throw new Error("projectId missing from response");

        if (!cancelled) {
          // Also update localStorage so legacy code still works
          localStorage.setItem("activeProject",   project);
          localStorage.setItem("activeProjectId", projectId);
          setState({ projectId, loading: false, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          // Fallback to localStorage in case of network error
          const fallback = localStorage.getItem("activeProjectId");
          setState({
            projectId: fallback,
            loading:   false,
            error:     err instanceof Error ? err.message : "Failed to resolve projectId",
          });
        }
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [org, project]); // re-runs whenever the URL org/project changes

  return state;
}