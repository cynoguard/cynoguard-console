'use client';

import { KeywordManager } from '@/components/dashboard/keyword-manager';
import { getActiveProjectId } from '@/lib/api/bot-management';

export default function KeywordsPage() {

  const projectId = getActiveProjectId() as string;
  
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Keyword Management
          </h1>

          <p className="max-w-3xl text-sm text-muted-foreground">
            Manage the keywords CynoGuard monitors across social platforms.
            Keywords determine what the monitoring engine scans and analyzes
            to detect phishing attempts, impersonation, and suspicious brand
            mentions.
          </p>
        </div>

        {/* Keyword Manager Component */}
        <KeywordManager projectId={projectId} />

      </div>
    </div>
  );
}