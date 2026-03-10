"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { ArrowLeft, Calendar, ChevronRight, FolderDot, Inbox } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Refined interface based on your API response
interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const orgId = typeof window !== "undefined" ? localStorage.getItem("activeOrg") : null;
  const {org} = useParams()
  const [projects, setProjects] = useState<Project[]>([]);
  const [orgName, setOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!orgId) {
        toast.error("No organization selected");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:4000/api/organization/${orgId}/projects`);
        
        if (response.data.status === "success") {
          // Based on your JSON: data.projects contains the org info, data.projects.projects is the array
          setProjects(response.data.data.projects.projects);
          setOrgName(response.data.data.projects.name);
        } else {
          toast.error(response.data.message || "Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [orgId]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="group text-muted-foreground hover:text-primary p-0"
            onClick={() => router.push('/organizations')}
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Organizations
          </Button>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight capitalize">
              {orgName || "Organization"} Projects
            </h1>
            <p className="text-muted-foreground text-lg">
              Select a project to view its performance and bot-detection metrics.
            </p>
          </div>
        </div>

        {/* Projects List */}
        <div className="grid gap-4">
          {isLoading ? (
            [1, 2].map((i) => (
              <Card key={i} className="animate-pulse bg-muted/40 border-none h-24" />
            ))
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <Card
                key={project.id}
                onClick={() =>{ 
                    localStorage.setItem("activeProjectName",project.name);
                    localStorage.setItem("activeProjectId",project.id);
                    router.push(`/${org}/${project.name}`);
                }}
                className="group cursor-pointer hover:border-primary/50 transition-all bg-card"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center text-secondary-foreground">
                      <FolderDot className="h-5 w-5" />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> 
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-primary font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Open Project
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
              <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                This organization hasn&apos;t created any projects.
              </p>
              <Button onClick={() => toast("Redirecting to create...")}>
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}