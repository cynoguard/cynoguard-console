"use client";

import { auth } from "@/lib/firebase";
import { AppDistpatch } from "@/store";
import { clearAuth, setAuth } from "@/store/authSlice";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export default function AppInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDistpatch>();
  const {organization} = useParams();

 useEffect(() => {
  console.log("Setting up auth state listener for organization:", auth.currentUser);
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed. Current user:", user);
    if (!user) {
      dispatch(clearAuth());
      return;
    }

    const token = await user.getIdToken();

    const res = await axios.get(`http://127.0.0.1:4000/api/auth/user?orgName=${organization}`,{
      headers:{
        Authorization:`Bearer ${token}`,
      }
    });

    const data = res.data;

    console.log("User data fetched:", data);

    dispatch(setAuth(data));
  });

  return unsubscribe;
}, [dispatch, organization]);

  return <>{children}</>;
}