/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { auth } from "@/lib/firebase";
import { RootState } from "@/store";
import { signInWithCustomToken } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const AuthInitializer = () => {
  const searchParams = useSearchParams();
  const token     = searchParams.get("token");
  const org       = searchParams.get("org");
  const project   = searchParams.get("project");
  const projectId = searchParams.get("projectId");
  const router    = useRouter();
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState<string | null>(null);
  const hasRun    = useRef(false); // guard against StrictMode double-invoke
  const authState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleAuth = async () => {
      // Already authenticated — go straight to dashboard
      if (authState.userId) {
        if (project && org) router.push(`/${org}/${project}/overview`);
        else if (org)       router.push(`/${org}/projects`);
        return;
      }

      if (!token || !org) {
        setError("Missing authentication parameters.");
        setLoading(false);
        return;
      }

      // Prevent double-invoke (React StrictMode / re-renders)
      if (hasRun.current) return;
      hasRun.current = true;

      try {
        console.log("Token parts:", token.split(".").length); // must be 3
        const header = JSON.parse(atob(token.split(".")[0]));

        const { user } = await signInWithCustomToken(auth, token);

        localStorage.setItem("organization", org);
        localStorage.setItem("authId",user.uid);
        if (project)   localStorage.setItem("activeProject",   project);
        if (projectId) localStorage.setItem("activeProjectId", projectId);

        if (project) {
          router.replace(`/${org}/${project}/overview`); // replace so back button skips bridge
        } else {
          router.replace(`/${org}/projects`);
        }
      } catch (err: any) {
        console.error("Auth bridge error:", err);
        hasRun.current = false; // allow retry if navigated back
        setError(err.message ?? "Authentication failed.");
        setLoading(false);
      }
    };

    handleAuth();
  }, []); // intentionally empty — run once on mount only

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background">
        <p className="text-sm text-destructive">Authentication failed: {error}</p>
        <button
          className="text-sm underline text-muted-foreground"
          onClick={() => router.push("/sign-in")}
        >
          Return to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p className="animate-pulse text-sm text-muted-foreground">Authenticating Session...</p>
    </div>
  );
};

export default AuthInitializer;