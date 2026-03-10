"use client"
import { auth } from "@/lib/firebase";
import { RootState } from "@/store";
import { signInWithCustomToken, UserCredential } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AuthInitializer = () => {

    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const org = searchParams.get("org");
    const project = searchParams.get("project");
    const router = useRouter();
    const [loading,setLoading] = useState(false);
    const authState =  useSelector((state:RootState)=>state.auth);
    useEffect(()=>{
     
       const handleAuth = async () => {
        if(!authState.userId){
            
        if(token && org){

            console.log(token)

            try {
                setLoading(true);
                localStorage.setItem("authToken", token);
                localStorage.setItem("organization", org);
                console.log("=== AUTH BRIDGE DEBUG ===");
console.log("Token from URL:", token?.substring(0, 50));
console.log("Token length:", token?.length);
console.log("Token parts:", token?.split(".").length); 
               const {user}:UserCredential = await signInWithCustomToken(auth,token);
               localStorage.setItem("authId",user.uid);

// must be 3
                if(project){
                 localStorage.setItem("activeProject",project)
                 router.push(`/${org}/${project}/overview`);
                }else{
                  router.push(`/${org}/projects`);
                }
            } catch (error) {
                console.error("Error during authentication:", error);
            } finally{
                setLoading(false);
            }
        }
    }
    }    

    handleAuth();
   
    },[authState.userId, org, project, router, token])

    if(loading){
     return <div className="flex h-screen w-full items-center justify-center bg-background">
         <p className="animate-pulse text-sm text-muted-foreground">Authenticating Session...</p>
      </div>    
    }
    return null;
}

export default AuthInitializer