"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Project } from "@/types/projects";
import { Inbox } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProjectsPage() {
    const params = useParams();
    const org = params?.org as string;

    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // useEffect(() => {
    //     const fetchProjects = async () => {
    //         if (!org) return;

    //         try {
    //             setIsLoading(true);
    //             const response = await getOrganizationProjects(org);

    //             if (response.success && response.data) {
    //                 setProjects(response.data);
    //             } else {
    //                 toast.error(response.message || "Failed to fetch projects");
    //             }
    //         } catch (error) {
    //             console.error("Error fetching projects:", error);
    //             toast.error(
    //                 error instanceof Error
    //                     ? error.message
    //                     : "Failed to fetch projects"
    //             );
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };

    //     fetchProjects();
    // }, [org]);

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl space-y-4">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">
                        Manage and select projects from your organization
                    </p>
                </div>

                {/* Projects Card */}
                <Card>
                    <CardContent className="p-6">
                        {projects.length > 0 ? (
                            <div className="space-y-2">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="p-3 rounded hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-primary/30"
                                    >
                                        <p className="font-medium">{project.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : !isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No projects found
                                </p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-8">
                                <p className="text-muted-foreground">Loading...</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}