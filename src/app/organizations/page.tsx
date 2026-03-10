"use client";

import { Badge } from "@/components/ui/badge"; // Assuming shadcn badge
import { Card, CardContent } from "@/components/ui/card";
import { RootState } from "@/store";
import axios from "axios";
import { Building2, ChevronRight, Inbox, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

// Define better types based on your API response
interface OrganizationMember {
  id: string;
  role: string;
  organization: {
    id: string;
    name: string;
    businessType: string;
    teamSize: string;
    isOnboarded: boolean;
  };
}

export default function OrganizationPage() {
  const authState = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [organizations, setOrganizations] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authId = localStorage.getItem("authId") || authState.firebaseId;
    
    if (!authId) return;

    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:4000/api/organizations/${authId}`
        );

        if (response.data.status === "success") {
          setOrganizations(response.data.data.organizations.organizationMembers);
        } else {
          toast.error(response.data.message || "Failed to fetch organizations");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to connect to server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [authState.firebaseId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-left">
          <h1 className="text-4xl font-extrabold tracking-tight">Select Organization</h1>
          <p className="text-muted-foreground text-lg">
            Welcome back. Choose a workspace to continue.
          </p>
        </div>

        {/* Organizations List */}
        <div className="grid gap-4">
          {isLoading ? (
            // Simple Skeleton State
            [1, 2].map((i) => (
              <Card key={i} className="animate-pulse bg-muted/50 border-none">
                <CardContent className="h-24" />
              </Card>
            ))
          ) : organizations.length > 0 ? (
            organizations.map((org) => (
              <Card
                key={org.id}
                onClick={() =>{ 
                    localStorage.setItem("activeOrgId",org.organization.id);
                    localStorage.setItem("activeOrgName",org.organization.name.trim());
                    router.push(`/${org.organization.name.trim()}/projects`)
                }}
                className="group cursor-pointer hover:border-primary/50 transition-all hover:shadow-md bg-card"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Organization Avatar Placeholder */}
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase">
                      {org.organization.name[0]}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-xl capitalize">
                          {org.organization.name}
                        </h3>
                        <Badge variant={org.role === "OWNER" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                          {org.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {org.organization.teamSize}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" /> {org.organization.businessType.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl">
              <Inbox className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground font-medium">No organizations found</p>
              <p className="text-sm text-muted-foreground">You haven&apos;t joined any organizations yet.</p>
            </div>
          )}
        </div>
        
        {/* <p className="text-center text-xs text-muted-foreground">
          Logged in as {auth.currentUser?.email}
        </p> */}
      </div>
    </div>
  );
}