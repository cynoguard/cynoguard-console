'use client';

import { KeywordManager } from '@/components/dashboard/keyword-manager';
import { useProjectId } from '@/hooks/use-project-id';
import { Loader2, AlertCircle } from 'lucide-react';

export default function KeywordsPage() {
  const { projectId, loading, error } = useProjectId();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span className="text-sm">{error ?? "Project not found"}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Keyword Management
          </h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Manage the keywords CynoGuard monitors across social platforms.
            Keywords determine what the monitoring engine scans and analyzes
            to detect phishing attempts, impersonation, and suspicious brand mentions.
          </p>
        </div>
        <KeywordManager projectId={projectId} />
      </div>
    </div>
  );
}