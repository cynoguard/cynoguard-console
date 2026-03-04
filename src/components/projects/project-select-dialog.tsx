"use client";

import { FolderOpen, Loader2, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Project } from "@/types/projects";


interface ProjectSelectDialogProps {
    open: boolean;
    orgId: string;
    projects: Project[];
    isLoading: boolean;
}

export function ProjectSelectDialog({
    open,
    orgId,
    projects,
    isLoading,
}: ProjectSelectDialogProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    const filteredProjects = projects.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectProject = async (project: Project) => {
        setSelectedProject(project.id);
        setIsNavigating(true);

        // Simulate a small delay for better UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Navigate to the project overview
        router.push(`/${orgId}/${project.id}/overview`);
    };

    return (
        <Dialog open={open} modal={true}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Select a Project
                            </DialogTitle>
                            <DialogDescription className="mt-1">
                                Choose a project to access its dashboard
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Search Input */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-background"
                            />
                        </div>

                        {/* Projects List */}
                        <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto">
                            {filteredProjects.length === 0 ? (
                                <div className="col-span-2 flex items-center justify-center py-12 text-center">
                                    <div className="space-y-2">
                                        <FolderOpen className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                                        <p className="text-sm text-muted-foreground">
                                            No projects found
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <Button
                                        key={project.id}
                                        variant="outline"
                                        className="h-auto py-3 px-4 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-center"
                                        onClick={() =>
                                            handleSelectProject(project)
                                        }
                                        disabled={
                                            isNavigating &&
                                            selectedProject === project.id
                                        }
                                    >
                                        <div className="flex items-center justify-center gap-2 w-full">
                                            <span className="font-medium text-sm flex-1">
                                                {project.name}
                                            </span>
                                            {isNavigating &&
                                                selectedProject === project.id && (
                                                    <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
                                                )}
                                        </div>
                                    </Button>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
