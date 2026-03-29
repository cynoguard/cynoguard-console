import { NextRequest } from "next/server";

import { forwardSocialMonitoringRequest } from "../../../_lib/social-monitoring-proxy";

type Params = { params: Promise<{ projectId: string; keywordId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { projectId, keywordId } = await params;
  return forwardSocialMonitoringRequest({
    request,
    pathname: `/api/v1/projects/${projectId}/keywords/${keywordId}`,
    method: "PATCH",
    includeBody: true,
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { projectId, keywordId } = await params;
  return forwardSocialMonitoringRequest({
    request,
    pathname: `/api/v1/projects/${projectId}/keywords/${keywordId}`,
    method: "DELETE",
  });
}
