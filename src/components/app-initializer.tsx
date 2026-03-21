"use client";

import { auth } from "@/lib/firebase";
import { AppDistpatch, RootState } from "@/store";
import { clearAuth, setAuth } from "@/store/authSlice";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch   = useDispatch<AppDistpatch>();
  const authState  = useSelector((state: RootState) => state.auth);
  const params     = useParams();
  const pathname   = usePathname();
  const router     = useRouter();
  const [loading, setLoading] = useState(true);

  const apiCallStateRef = useRef<"idle" | "pending" | "done">("idle");

  // Resolve org + project from URL params
  const organization  = (params?.organization as string) || pathname.split("/")[1];
  const projectName   = (params?.project as string)      || pathname.split("/")[2];

  // Step 1: Restore Redux from localStorage on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        dispatch(setAuth(JSON.parse(savedAuth)));
        setLoading(false);
        return;
      }
    } catch {
      // corrupt storage — continue to Firebase flow
    }
    setLoading(false);
  }, [dispatch]);

  // Step 2: Persist Redux to localStorage on change
  useEffect(() => {
    if (authState.userId) {
      localStorage.setItem("auth", JSON.stringify(authState));
    } else {
      localStorage.removeItem("auth");
    }
  }, [authState]);

  // Step 3a: Update activeProjectId when URL project changes (already authenticated)
  useEffect(() => {
    if (!authState.userId || !projectName) return;
    const orgData = localStorage.getItem("organization");
    if (!orgData) return;

    // Re-read projects from the API to find the matching projectId
    auth.currentUser?.getIdToken().then((idToken) => {
      const organization = localStorage.getItem("organization");
      if (!organization) return;
      fetch(
        `https://api.cynoguard.com/api/auth/user?orgName=${organization}`,
        { headers: { Authorization: `Bearer ${idToken}` } }
      )
        .then((r) => r.json())
        .then((res) => {
          const projects: { id: string; name: string }[] =
            res?.data?.org_member_info?.organization?.projects ?? [];
          const match = projects.find((p) => p.name === projectName) ?? projects[0];
          if (match) {
            localStorage.setItem("activeProject",   match.name);
            localStorage.setItem("activeProjectId", match.id);
          }
        })
        .catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName, authState.userId]);

  // Step 3: Sync with Firebase + backend if Redux is empty
  useEffect(() => {
    if (authState.userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        dispatch(clearAuth());
        apiCallStateRef.current = "idle";
        setLoading(false);
        return;
      }

      if (organization && apiCallStateRef.current === "idle") {
        apiCallStateRef.current = "pending";

        try {
          const idToken = await user.getIdToken();

          const res = await axios.get(
            `https://api.cynoguard.com/api/auth/user?orgName=${organization}`,
            { headers: { Authorization: `Bearer ${idToken}` } }
          );

          const { user: userData, organization: orgData } =
            res.data.data.org_member_info;

          // ── Set Redux auth state ──────────────────────────
          dispatch(setAuth({ userId: userData.id, ...userData }));

          // ── Persist org info ──────────────────────────────
          localStorage.setItem("organization", orgData.name);
          localStorage.setItem("organizationId", orgData.id);

          // ── Resolve active project ────────────────────────
          // Priority: URL param → first project in org
          const projects: { id: string; name: string }[] = orgData.projects ?? [];

          const activeProject =
            projects.find((p) => p.name === projectName) ?? projects[0];

          if (activeProject) {
            localStorage.setItem("activeProject",   activeProject.name);
            localStorage.setItem("activeProjectId", activeProject.id);   // ← what API calls use
          }

          apiCallStateRef.current = "done";
        } catch (error) {
          console.error("Backend fetch failed:", error);
          dispatch(clearAuth());
          apiCallStateRef.current = "idle";

          // If auth fails on a protected route, redirect to login
          // if (!pathname.startsWith("/auth-bridge") && !pathname.startsWith("/onboarding")) {
          //   router.push("/sign-in");
          // }
        } finally {
          setLoading(false);
        }
      } else if (!organization) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      apiCallStateRef.current = "idle";
    };
  }, [authState.userId, dispatch, organization, pathname, projectName, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="animate-pulse text-sm text-muted-foreground">Initializing Console...</p>
      </div>
    );
  }

  return <>{children}</>;
}