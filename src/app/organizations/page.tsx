"use client";

import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { AppDistpatch, RootState } from "@/store";
import { setFirebaseId } from "@/store/authSlice";
import axios from "axios";
import { Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function OrganizationPage() {
    const authState = useSelector((state:RootState)=>state.auth);
    const dispatch = useDispatch<AppDistpatch>();
    const user = auth.currentUser;
    const [projects, setProjects] = useState<{id:string,name:string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Step 1: Sync Firebase UID to Redux if missing
    useEffect(() => {
        console.log("got this 2")
        if (!authState.firebaseId && user?.uid) {
            dispatch(setFirebaseId(user.uid));
            console.log("got this",authState.firebaseId)
        }
    }, [user?.uid, authState.firebaseId, dispatch]);

    // Step 2: Fetch projects only when firebaseId is ready
    useEffect(() => {
        if (!authState.firebaseId) {
            return; // Wait for firebaseId to be set
        }

        const fetchProjects = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(
                    `http://127.0.0.1:4000/api/organizations/${authState.firebaseId}`
                );
                
                if (response.data.success && response.data.data) {
                    setProjects(response.data.data.organizations);
                } else {
                    toast.error(response.data.message || "Failed to fetch projects");
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
    }, [authState.firebaseId]); // Only depend on firebaseId

    return (
        <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl space-y-4">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">
                        Manage and select organizations associate with your identity
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
                                    No organizations found
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