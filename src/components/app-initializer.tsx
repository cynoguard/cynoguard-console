"use client";

import { auth } from "@/lib/firebase";
import { AppDistpatch, RootState } from "@/store";
import { clearAuth, setAuth } from "@/store/authSlice";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDistpatch>();
  const authState = useSelector((state:RootState)=>state.auth);
  const params = useParams();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  
  const apiCallStateRef = useRef<"idle" | "pending" | "done">("idle");
  const organization = params?.organization || pathname.split("/")[1];

  // Step 1: Restore Redux from localStorage on mount
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("auth");
      if (savedAuth) {
        dispatch(setAuth(JSON.parse(savedAuth)));
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Failed to restore auth from localStorage:", error);
    }

    // If no saved auth, continue with normal flow
    setLoading(false);
  }, [dispatch]);

  // Step 2: Persist Redux to localStorage whenever it changes
  useEffect(() => {
    if (authState.userId) {
      localStorage.setItem("auth", JSON.stringify(authState));
    } else {
      localStorage.removeItem("auth");
    }
  }, [authState]);

  // Step 3: Sync with Firebase if needed
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

      if (user && organization && apiCallStateRef.current === "idle") {
        apiCallStateRef.current = "pending";
        
        try {
          const token = await user.getIdToken();
          console.log("Fetching data for:", organization);
          
          const res = await axios.get(
            `http://127.0.0.1:4000/api/auth/user?orgName=${organization}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const userData = res.data.data.org_member_info.user;
          dispatch(setAuth({ userId: userData.id, ...userData }));
          apiCallStateRef.current = "done";

        } catch (error) {
          console.error("Backend fetch failed:", error);
          dispatch(clearAuth());
          apiCallStateRef.current = "idle";
        } finally {
          setLoading(false);
        }
      } else if (user && !organization) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      apiCallStateRef.current = "idle";
    };
  }, [authState.userId, dispatch, organization]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="animate-pulse text-sm text-muted-foreground">Initializing Console...</p>
      </div>
    );
  }

  return <>{children}</>;
}