import { NextRequest } from "next/server";

import { forwardSocialMonitoringRequest } from "../../../_lib/social-monitoring-proxy";

type Params = { params: Promise<{ projectId: string; mentionId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { projectId, mentionId } = await params;
  return forwardSocialMonitoringRequest({
    request,
    pathname: `/api/v1/projects/${projectId}/mentions/${mentionId}`,
    method: "GET",
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { projectId, mentionId } = await params;
  return forwardSocialMonitoringRequest({
    request,
    pathname: `/api/v1/projects/${projectId}/mentions/${mentionId}`,
    method: "PATCH",
    includeBody: true,
  });
}
