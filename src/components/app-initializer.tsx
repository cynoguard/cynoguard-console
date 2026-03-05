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
  
  // Track API call state
  const apiCallStateRef = useRef<"idle" | "pending" | "done">("idle");

  const organization = params?.organization || pathname.split("/")[1];

  useEffect(() => {
    
    if(authState.userId){
      setLoading(false)
      return;
    }
   
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
   
      // 1. If no user, clear state and stop loading
      if (!user) {
        dispatch(clearAuth());
        apiCallStateRef.current = "idle";
        setLoading(false);
        return;
      }

      // 2. Only fetch if state is idle (not pending or done)
      if (user && organization && apiCallStateRef.current === "idle") {
        apiCallStateRef.current = "pending"; // Mark as in-progress
        
        try {
          const token = await user.getIdToken();
          console.log("Fetching data for:", organization);
          
          const res = await axios.get(`http://127.0.0.1:4000/api/auth/user?orgName=${organization}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const userData = res.data.data.org_member_info.user;
          dispatch(setAuth({userId:userData.id,...userData}));
          apiCallStateRef.current = "done"; // Mark as complete

        } catch (error) {
          console.error("Backend fetch failed:", error);
          dispatch(clearAuth());
          apiCallStateRef.current = "idle"; // Reset on error so retry is possible
        } finally {
          setLoading(false);
        }
      } else if (user && !organization) {
        // Still waiting for organization
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      apiCallStateRef.current = "idle"; // Reset on unmount
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