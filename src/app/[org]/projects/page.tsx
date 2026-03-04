"use client";

import { ProjectSelectDialog } from "@/components/projects/project-select-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Project } from "@/types/projects";
import { Inbox } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProjectsPage() {
    const params = useParams();
    const org = params?.org as string;

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            if (!org) return;

            try {
                setIsLoading(true);
                const response = await getOrganizationProjects(org);

                if (response.success && response.data) {
                    setProjects(response.data);
                } else {
                    toast.error(response.message || "Failed to fetch projects");
                }
            } catch (error) {
                console.error("Error fetching projects:", error);
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch projects"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, [org]);

    return (
        <div className="flex-1 space-y-6 p-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground">
                    Manage and select projects from your organization
                </p>
            </div>

            {/* Projects Grid */}
            {projects.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
                            onClick={() => setDialogOpen(true)}
                        >
                            <CardHeader className="py-4">
                                <CardTitle className="text-base group-hover:text-primary transition-colors">
                                    {project.name}
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            ) : !isLoading ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No projects found
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            {/* Project Select Dialog */}
            <ProjectSelectDialog
                open={dialogOpen}
                orgId={org}
                projects={projects}
                isLoading={isLoading}
            />
        </div>
    );
}
