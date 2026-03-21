"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Calendar, ChevronRight, FolderDot, Inbox, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router  = useRouter();
  const { org } = useParams();

  const [projects,   setProjects]   = useState<Project[]>([]);
  const [orgName,    setOrgName]    = useState("");
  const [isLoading,  setIsLoading]  = useState(true);
  const [idToken,    setIdToken]    = useState<string | null>(null);

  // New project dialog state
  const [addOpen,      setAddOpen]      = useState(false);
  const [projectName,  setProjectName]  = useState("");
  const [domain,       setDomain]       = useState("");
  const [environment,  setEnvironment]  = useState("production");
  const [isCreating,   setIsCreating]   = useState(false);

  // Step 1 — wait for Firebase auth to restore, then get token
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        toast.error("Session expired");
        router.push("/sign-in");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Step 2 — fetch projects once token is available
  useEffect(() => {
    if (!idToken) return;

    const fetchProjects = async () => {
      try {
        setIsLoading(true);

        const orgId = localStorage.getItem("organizationId");
        if (!orgId) {
          toast.error("No organization found");
          return;
        }

        const response = await axios.get(
          `https://api.cynoguard.com/api/organization/${orgId}/projects`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );

        if (response.data.status === "success") {
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
  }, [idToken]);

  const handleSelectProject = (project: Project) => {
    localStorage.setItem("activeProject",   project.name);
    localStorage.setItem("activeProjectId", project.id);
    router.push(`/${org}/${project.name}/overview`);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim() || !domain.trim()) {
      toast.error("Project name and domain are required");
      return;
    }

    try {
      setIsCreating(true);

      const orgId = localStorage.getItem("organizationId");

      const response = await axios.post(
        `http://localhost:4000/api/organization/${orgId}/projects`,
        {
          name:        projectName.trim().toLowerCase(),
          primaryDomain: domain.trim(),
          environmentType: environment,
        },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );

      if (response.data.status === "success") {
        const newProject = response.data.data.project;
        setProjects(prev => [...prev, newProject]);
        setAddOpen(false);
        setProjectName("");
        setDomain("");
        setEnvironment("production");
        toast.success("Project created successfully");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">

        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="group text-muted-foreground hover:text-primary p-0"
            onClick={() => router.push("/organizations")}
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Organizations
          </Button>

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight capitalize">
                {orgName || "Organization"} Projects
              </h1>
              <p className="text-muted-foreground text-lg">
                Select a project to view its performance and bot-detection metrics.
              </p>
            </div>

            <Button
              onClick={() => setAddOpen(true)}
              className="shrink-0 mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
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
                onClick={() => handleSelectProject(project)}
                className="group cursor-pointer hover:border-primary/50 transition-all bg-card"
              >
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded bg-secondary flex items-center justify-center">
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
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Project Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Add a new project under {orgName || "your organization"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="e.g. my-app"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Primary Domain</Label>
              <Input
                id="domain"
                placeholder="e.g. myapp.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setAddOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreateProject}
                disabled={isCreating || !projectName.trim() || !domain.trim()}
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}