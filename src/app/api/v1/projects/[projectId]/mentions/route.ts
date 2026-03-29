import { NextRequest } from "next/server";

import { forwardSocialMonitoringRequest } from "../../_lib/social-monitoring-proxy";

type Params = { params: Promise<{ projectId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { projectId } = await params;
  return forwardSocialMonitoringRequest({
    request,
    pathname: `/api/v1/projects/${projectId}/mentions`,
    method: "GET",
    includeQuery: true,
  });
}
